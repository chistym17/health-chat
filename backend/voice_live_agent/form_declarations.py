"""
Appointment scheduling function declarations for Pipecat
"""

# Function declarations for appointment scheduling
open_appointment_decl = {
    "name": "open_appointment",
    "description": "Open a new appointment scheduling form",
    "properties": {
        "appointment_type": {
            "type": "string",
            "enum": ["general", "urgent", "follow_up"],
            "description": "Type of appointment to schedule"
        }
    },
    "required": ["appointment_type"]
}

update_appointment_field_decl = {
    "name": "update_appointment_field",
    "description": "Update a specific field in the current appointment form",
    "properties": {
        "field_name": {
            "type": "string",
            "description": "Name of the field to update (patient_name, email, appointment_reason, urgency_level, preferred_date, previous_visit_date)"
        },
        "value": {
            "type": "string",
            "description": "Value to set for the field"
        }
    },
    "required": ["field_name", "value"]
}

submit_appointment_decl = {
    "name": "submit_appointment",
    "description": "Submit the current appointment if all required fields are filled",
    "properties": {},
    "required": []
}

# Keep old declarations for backward compatibility
open_form_decl = open_appointment_decl
update_form_field_decl = update_appointment_field_decl
submit_form_decl = submit_appointment_decl

# All function declarations
function_declarations = [
    open_appointment_decl,
    update_appointment_field_decl,
    submit_appointment_decl
] 