from fastapi import HTTPException
import requests
import json
import logging
import sys

# Set up logging to output to both console and a file for easier debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("llm_debug.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("llm_service")

# Configuration for the LLM
LLM_API_URL = "http://localhost:11434/api/generate" 
LLM_MODEL = "gemma4:31b-cloud"

def get_llm_recommendation(disease_name: str):
    """
    Fallback basic recommendation logic.
    """
    prompt = (
        f"The crop has been diagnosed with {disease_name}. "
        "Provide a concise professional agricultural recommendation in JSON format."
    )
    return _call_llm(prompt)

def get_llm_recommendation_rag(full_prompt: str):
    """
    Receives a full RAG prompt (Context + Query) and returns the LLM's answer.
    """
    return _call_llm(full_prompt)

def _call_llm(prompt: str):
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    logger.info(f"Sending request to Ollama. Model: {LLM_MODEL}")
    logger.debug(f"Full Prompt sent:\n{prompt}")

    try:
        response = requests.post(LLM_API_URL, json=payload, timeout=30)
        
        # Log the raw response status and content for debugging
        logger.info(f"Ollama responded with status: {response.status_code}")
        logger.debug(f"Raw Response Content: {response.text}")
        
        response.raise_for_status() 
        
        result = response.json()
        response_text = result.get("response", "")
        logger.debug(f"Extracted Response Text: {response_text}")
        
        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parsing failed: {e}\nResponse was: {response_text}")
            return {
                "overview": "The AI provided a response, but it wasn't in the correct format.",
                "immediate_actions": ["Consult an expert"],
                "treatment": ["N/A"],
                "prevention": ["N/A"],
                "precautions": ["N/A"]
            }

    except requests.exceptions.ConnectTimeout:
        logger.error("LLM Connection Timeout: Server took too long to respond.")
        return {"error": "Connection timed out. Please check if your LLM server is overloaded."}

    except requests.exceptions.ConnectionError:
        logger.error("LLM Connection Error: Could not connect to the server. Check if Ollama is running.")
        return {"error": "Unable to connect to the AI server. Please ensure Ollama is running."}

    except requests.exceptions.HTTPError as http_err:
        logger.error(f"LLM HTTP Error: {http_err}")
        return {"error": f"The AI server returned an error (HTTP {response.status_code})."}

    except Exception as e:
        logger.exception(f"Unexpected LLM Error: {str(e)}")
        return {"error": f"An unexpected error occurred: {str(e)}"}
