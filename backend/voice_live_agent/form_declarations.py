open_form_decl = {
    "name": "open_form",
    "description": "Open a new form for the user to fill out.",
    "properties": {
        "form_type": {
            "type": "string",
            "enum": ["registration", "contact", "feedback"],
            "description": "Type of form to open."
        }
    },
    "required": ["form_type"]
}

update_form_field_decl = {
    "name": "update_form_field",
    "description": "Update a specific field in the current form.",
    "properties": {
        "field_name": {
            "type": "string",
            "description": "Name of the field to update."
        },
        "value": {
            "type": "string",
            "description": "Value to set for the field."
        }
    },
    "required": ["field_name", "value"]
}

submit_form_decl = {
    "name": "submit_form",
    "description": "Submit the current form if all required fields are filled.",
    "properties": {},
    "required": []
}

function_declarations = [open_form_decl, update_form_field_decl, submit_form_decl] 