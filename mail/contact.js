$(function () {

    $("#contactForm input, #contactForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function ($form, event, errors) {
        },
        submitSuccess: function ($form, event) {
            event.preventDefault();
            var name = $("input#name").val();
            var email = $("input#email").val();
            var subject = $("input#subject").val();
            var message = $("textarea#message").val();

            var $this = $("#sendMessageButton");
            $this.prop("disabled", true);

            $.ajax({
                url: "mail/contact.php",
                type: "POST",
                data: {
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                },
                cache: false,
                success: function () {
                    $('#success').html(
                        "<div class='alert alert-success' role='status'>" +
                        "<strong>Thank you — your message has been sent.</strong> " +
                        "We usually reply within one working day." +
                        "</div>"
                    );
                    $('#contactForm').trigger("reset");
                },
                error: function () {
                    // The mail endpoint needs PHP. On a static host it will never
                    // answer, so hand the visitor a route that always works
                    // rather than a dead end.
                    var nl = String.fromCharCode(10);
                    var body = "Name: " + name + nl + "Email: " + email + nl + nl + message;
                    var mailto = "mailto:joistengineering@gmail.com" +
                        "?subject=" + encodeURIComponent(subject || "Project enquiry") +
                        "&body=" + encodeURIComponent(body);
                    var whatsapp = "https://wa.me/9779856083243?text=" +
                        encodeURIComponent(subject ? subject + " — " + body : body);

                    $('#success').html(
                        "<div class='alert alert-danger' role='alert'>" +
                        "<p><strong>We couldn't send that from the website.</strong> " +
                        "Your message is still in the form — send it directly instead:</p>" +
                        "<p class='contact-fallback'>" +
                        "<a href='" + mailto + "'>Email us</a> " +
                        "<a href='" + whatsapp + "' target='_blank' rel='noopener'>WhatsApp us</a>" +
                        "</p></div>"
                    );
                },
                complete: function () {
                    setTimeout(function () {
                        $this.prop("disabled", false);
                    }, 1000);
                }
            });
        },
        filter: function () {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
    });
});

$('#name').focus(function () {
    $('#success').html('');
});
