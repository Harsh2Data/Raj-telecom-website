const validateLead = (lead) => {

    const errors = [];

    if (!lead.name || lead.name.trim() === "") {
        errors.push({
            field: "name",
            message: "Name is required."
        });
    }

    if (!lead.phone || lead.phone.trim() === "") {
        errors.push({
            field: "phone",
            message: "Phone number is required."
        });
    }
    else if (!/^[6-9]\d{9}$/.test(lead.phone)) {

        errors.push({
            field: "phone",
            message: "Enter a valid Indian mobile number."
        });

    }

    if (!lead.brand || lead.brand.trim() === "") {

        errors.push({
            field: "brand",
            message: "Brand is required."
        });

    }

    if (!lead.model || lead.model.trim() === "") {

        errors.push({
            field: "model",
            message: "Model is required."
        });

    }

    if (!lead.issue || lead.issue.trim() === "") {

        errors.push({
            field: "issue",
            message: "Issue is required."
        });

    }

    return errors;

};

module.exports = {
    validateLead
};