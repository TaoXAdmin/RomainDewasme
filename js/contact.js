/**
 * CONTACT FORM JAVASCRIPT
 * Site web magicien
 * Gestion du formulaire de contact avec EmailJS
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser EmailJS avec votre ID utilisateur
    // Remplacez 'your_user_id' par votre véritable ID utilisateur EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init('YzwoYUFW2EjNiVS0K');
    } else {
        console.warn("EmailJS n'est pas chargé. Le formulaire fonctionnera en mode démo.");
    }
    
    // Initialiser la gestion du formulaire
    initContactForm();
});

/**
 * Initialisation et gestion du formulaire de contact
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (contactForm) {
        // Gestionnaire de soumission du formulaire
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Animation du bouton pendant le chargement
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const buttonText = submitButton.querySelector('.btn-text');
            const originalText = buttonText.textContent;
            
            buttonText.textContent = 'Envoi en cours...';
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            
            // Masquer tout message d'état précédent
            if (formStatus) {
                formStatus.className = 'form-status';
                formStatus.textContent = '';
            }
            
            // Vérifier si EmailJS est disponible
            if (typeof emailjs !== 'undefined') {
                // Paramètres pour l'envoi d'email
                const templateParams = {
                    name: contactForm.name.value,
                    email: contactForm.email.value,
                    phone: contactForm.phone.value,
                    eventType: contactForm.eventType.value,
                    message: contactForm.message.value
                };
                
                // Remplacez 'your_service_id' et 'your_template_id' par vos véritables ID
                emailjs.send('service_plrym7b', 'template_0riyjcp', templateParams)
                    .then(function(response) {
                        console.log('Succès!', response.status, response.text);
                        showFormSuccess();
                        contactForm.reset();
                    }, function(error) {
                        console.log('Échec...', error);
                        showFormError("Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.");
                    })
                    .finally(() => {
                        // Restaurer l'état du bouton
                        buttonText.textContent = originalText;
                        submitButton.disabled = false;
                        submitButton.classList.remove('loading');
                    });
            } else {
                // Mode démo (simulation de succès)
                setTimeout(() => {
                    console.log('EmailJS non disponible, simulant un succès...');
                    showFormSuccess();
                    contactForm.reset();
                    
                    // Restaurer l'état du bouton
                    buttonText.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.classList.remove('loading');
                }, 1500);
            }
        });
        
        // Ajouter des effets visuels aux champs du formulaire
        initFormFieldEffects();
    }
}

/**
 * Afficher un message de succès
 */
function showFormSuccess() {
    const formStatus = document.getElementById('formStatus');
    
    if (formStatus) {
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Votre message a été envoyé avec succès! Nous vous contacterons dans les plus brefs délais.';
        
        // Animer l'apparition du message
        formStatus.style.opacity = '0';
        formStatus.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            formStatus.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            formStatus.style.opacity = '1';
            formStatus.style.transform = 'translateY(0)';
        }, 10);
        
        // Masquer le message après un délai
        setTimeout(() => {
            formStatus.style.opacity = '0';
            
            setTimeout(() => {
                formStatus.className = 'form-status';
                formStatus.textContent = '';
                formStatus.style.transition = '';
            }, 500);
        }, 5000);
    }
}

/**
 * Afficher un message d'erreur
 */
function showFormError(message) {
    const formStatus = document.getElementById('formStatus');
    
    if (formStatus) {
        formStatus.className = 'form-status error';
        formStatus.textContent = message;
        
        // Animer l'apparition du message
        formStatus.style.opacity = '0';
        formStatus.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            formStatus.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            formStatus.style.opacity = '1';
            formStatus.style.transform = 'translateY(0)';
        }, 10);
    }
}

/**
 * Effets visuels pour les champs du formulaire
 */
function initFormFieldEffects() {
    const formFields = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    
    formFields.forEach(field => {
        // Gérer l'état focus
        field.addEventListener('focus', () => {
            // Ajouter un effet subtil de mise en évidence
            if (typeof gsap !== 'undefined') {
                gsap.to(field, {
                    borderColor: 'var(--color-secondary)',
                    boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                field.style.borderColor = 'var(--color-secondary)';
                field.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
            }
        });
        
        // Restaurer l'état normal lors de la perte de focus
        field.addEventListener('blur', () => {
            // Vérifier si le champ est vide pour l'animation du label
            const label = field.nextElementSibling;
            if (field.value.trim() === '' && label && label.classList.contains('form-label')) {
                label.classList.remove('active');
            }
            
            // Retirer l'effet de mise en évidence
            if (typeof gsap !== 'undefined') {
                gsap.to(field, {
                    borderColor: field.value.trim() !== '' ? 'var(--color-primary-light)' : 'var(--color-light-gray)',
                    boxShadow: 'none',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                field.style.borderColor = field.value.trim() !== '' ? 'var(--color-primary-light)' : 'var(--color-light-gray)';
                field.style.boxShadow = 'none';
            }
        });
        
        // Gérer l'animation du label pour les champs non-vides
        field.addEventListener('input', () => {
            const label = field.nextElementSibling;
            if (label && label.classList.contains('form-label')) {
                if (field.value.trim() !== '') {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            }
        });
        
        // S'assurer que les champs déjà remplis ont leurs labels animés
        if (field.value.trim() !== '') {
            const label = field.nextElementSibling;
            if (label && label.classList.contains('form-label')) {
                label.classList.add('active');
            }
        }
    });
    
    // Ajouter un effet d'animation spécial pour le bouton d'envoi
    const submitButton = document.querySelector('.form-submit');
    if (submitButton) {
        submitButton.addEventListener('mouseenter', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(submitButton, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'back.out(1.5)'
                });
            }
        });
        
        submitButton.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(submitButton, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    }
}
