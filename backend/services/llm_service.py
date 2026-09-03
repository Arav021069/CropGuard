# from fastapi import HTTPException
import requests
import json
import logging
import sys
# import re

# Set up logging
logging.basicConfig(
    level=logging.INFO,
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
    prompt = (
        f"The crop has been diagnosed with {disease_name}. "
        "Provide a concise professional agricultural recommendation in JSON format."
    )
    return _call_llm(prompt)


def get_llm_recommendation_rag(full_prompt: str):
    return _call_llm(full_prompt)


def _extract_json(text):
    """
    Forcefully extracts the first JSON object found in a string.
    Fixes 'Expecting value: line 1 column 1' errors.
    """
    try:
        # Find the first '{' and the last '}'
        start_idx = text.find('{')
        end_idx = text.rfind('}')

        if start_idx == -1 or end_idx == -1:
            return None

        json_str = text[start_idx:end_idx + 1]
        return json.loads(json_str)
    except Exception as e:
        logger.error(f"JSON Extraction failed: {e}")
        return None


def _call_llm(prompt: str):
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    logger.info(f"Requesting LLM response for model: {LLM_MODEL}")

    try:
        response = requests.post(LLM_API_URL, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        response_text = result.get("response", "")

        logger.debug(f"Raw Response from LLM: {response_text}")

        # Use the extractor to handle any conversational noise or empty responses
        parsed_json = _extract_json(response_text)

        if parsed_json:
            return parsed_json

        logger.error("LLM returned non-JSON content or empty response.")
        return {
            "overview": "The AI was unable to generate a structured response.",
            "immediate_actions": ["Consult an expert"],
            "treatment": ["N/A"],
            "prevention": ["N/A"],
            "precautions": ["N/A"]
        }

    except requests.exceptions.ConnectTimeout:
        logger.error("LLM Connection Timeout")
        return {"error": "Connection timed out."}
    except requests.exceptions.ConnectionError:
        logger.error("LLM Connection Error")
        return {"error": "Unable to connect to the AI server."}
    except requests.exceptions.HTTPError as http_err:
        logger.error(f"LLM HTTP Error: {http_err}")
        return {"error": f"AI Server Error: {response.status_code}"}
    except Exception as e:
        logger.exception(f"Unexpected LLM Error: {str(e)}")
        return {"error": "An unexpected error occurred."}
