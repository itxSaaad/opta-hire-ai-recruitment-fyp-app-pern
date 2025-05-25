import logging
from typing import List, Dict, Any
from datetime import datetime, timezone
from utils.response_utils import format_response, format_error_response
from utils.validation_utils import (
    validate_job_data,
    validate_resume_data,
    validate_application_data,
)
from utils.error_utils import AIModelError, ValidationError, log_error
from models.candidate_matcher import CandidateMatcher


class ShortlistController:
    """
    Controller for AI-powered candidate shortlisting

    This is the heart of your recruitment optimization system. When a job is closed,
    this controller evaluates all applicants and identifies the top 5 candidates
    who are most likely to be successful in the role.
    """

    def __init__(self):
        self.matcher = CandidateMatcher()

    def shortlist_candidates(self, request_data):
        """
        Main shortlisting endpoint - identifies top 5 candidates for a job

        This is called by your Node.js server when a job status changes to 'closed'
        and you need to automatically shortlist the best candidates for interviews.

        Expected data format:
        {
          "job": { job_data },
          "applications": [
            {
              "id": "application_id",
              "candidateId": "candidate_id",
              "candidate": { candidate_data },
              "resume": { resume_data },
              "status": "applied"
            }
          ]
        }
        """
        try:
            # Validate request structure
            if not request_data:
                raise ValidationError("Request body is required")

            if "job" not in request_data:
                raise ValidationError("Missing job data in request")

            if "applications" not in request_data:
                raise ValidationError("Missing applications data in request")

            # Extract and validate job data
            job_data = request_data["job"]
            job_valid, job_error = validate_job_data(job_data)
            if not job_valid:
                raise ValidationError(f"Invalid job data: {job_error}")

            # Extract and validate applications
            applications = request_data["applications"]
            if not isinstance(applications, list):
                raise ValidationError("Applications must be an array")

            if len(applications) == 0:
                return format_response(
                    success=True,
                    message="No applications found for this job",
                    data={
                        "shortlisted_candidates": [],
                        "total_applications": 0,
                        "job_id": job_data.get("id"),
                        "job_title": job_data.get("title"),
                    },
                )

            # Validate and prepare application data
            valid_applications = []
            for idx, application in enumerate(applications):
                try:
                    # Validate application structure
                    app_valid, app_error = validate_application_data(application)
                    if not app_valid:
                        logging.warning(
                            f"Skipping invalid application {idx}: {app_error}"
                        )
                        continue

                    # Validate resume data if present
                    if "resume" in application and application["resume"]:
                        resume_valid, resume_error = validate_resume_data(
                            application["resume"]
                        )
                        if not resume_valid:
                            logging.warning(
                                f"Skipping application {idx}: {resume_error}"
                            )
                            continue

                    # Only consider applications with 'applied' status
                    if application.get("status") == "applied":
                        valid_applications.append(application)

                except Exception as e:
                    logging.warning(f"Error validating application {idx}: {str(e)}")
                    continue

            if len(valid_applications) == 0:
                return format_response(
                    success=True,
                    message="No valid applications found for shortlisting",
                    data={
                        "shortlisted_candidates": [],
                        "total_applications": len(applications),
                        "valid_applications": 0,
                        "job_id": job_data.get("id"),
                        "job_title": job_data.get("title"),
                    },
                )

            logging.info(
                f"Starting shortlisting process for job '{job_data.get('title')}' with {len(valid_applications)} valid applications"
            )

            # Check if AI model is trained
            if not self.matcher.is_trained:
                raise AIModelError(
                    "AI model is not trained yet. Please train the model before shortlisting candidates.",
                    error_code="MODEL_NOT_TRAINED",
                )

            # Perform AI-powered shortlisting
            shortlisted_candidates = self.matcher.shortlist_candidates(
                job_data, valid_applications
            )

            # Prepare response data (matching your Node.js response patterns)
            response_data = {
                "shortlisted_candidates": shortlisted_candidates,
                "total_applications": len(applications),
                "valid_applications": len(valid_applications),
                "shortlisted_count": len(shortlisted_candidates),
                "job_id": job_data.get("id"),
                "job_title": job_data.get("title"),
                "shortlisting_metadata": {
                    "model_version": "1.0.0",
                    "algorithm": "multi_factor_scoring",
                    "weights_used": self.matcher.weights,
                    "processing_timestamp": self._get_current_timestamp(),
                },
            }

            success_message = f"Successfully shortlisted {len(shortlisted_candidates)} candidates from {len(valid_applications)} applications for {job_data.get('title')} position"

            logging.info(f"✅ {success_message}")

            return format_response(
                success=True, message=success_message, data=response_data
            )

        except ValidationError as e:
            return format_error_response(
                message=e.message,
                status_code=400,
                error_code="SHORTLISTING_VALIDATION_ERROR",
            )
        except AIModelError as e:
            log_error(e, "AI model error during shortlisting")
            return format_error_response(
                message=e.message, status_code=500, error_code=e.error_code
            )
        except Exception as e:
            log_error(e, "Unexpected error during candidate shortlisting")
            return format_error_response(
                message="An unexpected error occurred during candidate shortlisting",
                status_code=500,
                error_code="SHORTLISTING_UNEXPECTED_ERROR",
            )

    def preview_shortlist(self, request_data):
        """
        Preview shortlisting results without making any changes

        This allows recruiters to see what the AI would recommend before
        actually updating the application statuses in the database.
        """
        try:
            # Use the same shortlisting logic but don't update anything
            result = self.shortlist_candidates(request_data)

            # Modify the response to indicate this is a preview
            if result.status_code == 200:
                response_data = result.get_json()
                response_data["data"]["preview_mode"] = True
                response_data["message"] = f"Preview: {response_data['message']}"

                return format_response(
                    success=True,
                    message=response_data["message"],
                    data=response_data["data"],
                )
            else:
                return result

        except Exception as e:
            log_error(e, "Error during shortlisting preview")
            return format_error_response(
                message="Failed to generate shortlisting preview",
                status_code=500,
                error_code="PREVIEW_ERROR",
            )

    def _get_current_timestamp(self):
        """Get current timestamp in ISO format (matching Node.js patterns)"""
        return datetime.now(timezone.utc).isoformat() + "Z"
