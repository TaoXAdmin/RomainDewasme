/**
 * MAIN JAVASCRIPT
 * Site web magicien
 * Fonctionnalités principales et initialisation
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les différentes fonctionnalités
    initLoading();
    initNavigation();
    initScrollEffects();
    initTestimonialSlider();
    initYearUpdate();
});

/**
 * Animation de chargement initial
 */
function initLoading() {
  if (document.getElementById('actusLoader')) return;

  let loadingElement = document.querySelector('.loading');

  if (!loadingElement) {
    loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.innerHTML = `
      <div class="loading__logo">ROMAIN DEWASME</div>
    `;
    document.body.appendChild(loadingElement);
  }

  const heroVideo = document.getElementById('heroVideo');
  let loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;

    const el = document.querySelector('.loading');
    if (el) {
      el.classList.add('hidden');
      setTimeout(() => {
        el.remove();
      }, 500);
    }

    animateHeroEntrance();
  }

  function waitForHeroVideo() {
    if (!heroVideo) {
      hideLoader();
      return;
    }

    const ready = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hideLoader();
        });
      });
    };

    if (heroVideo.readyState >= 2) {
      ready();
      return;
    }

    heroVideo.addEventListener('loadeddata', ready, { once: true });
    heroVideo.addEventListener('canplay', ready, { once: true });
    heroVideo.addEventListener('error', hideLoader, { once: true });

    // sécurité au cas où la vidéo met trop longtemps
    setTimeout(hideLoader, 5000);
  }

  window.addEventListener('load', waitForHeroVideo, { once: true });
}

/**
 * Animation d'entrée de la section hero
 */
function animateHeroEntrance() {
    const heroElements = document.querySelectorAll('.hero .reveal-text, .hero .reveal-element');
    
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            if (element.classList.contains('reveal-text')) {
                element.classList.add('revealing');
                
                // Retirer la classe d'animation après l'exécution
                setTimeout(() => {
                    element.classList.remove('revealing');
                    element.style.opacity = 1;
                }, 1200);
            } else {
                element.classList.add('revealed');
            }
        }, index * 300);
    });
}

/**
 * Initialisation de la navigation
 */
function initNavigation() {
    const header = document.querySelector('.header');
    const navToggle = document.querySelector('.nav__toggle');
    const navLinks = document.querySelectorAll('.nav__link');
    const sections = document.querySelectorAll('section[id]');
    
    // Gestion du scroll pour le header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        // Mettre à jour l'élément de navigation actif en fonction de la section visible
        updateActiveNavOnScroll();
    });
    
    // Si le toggle menu existe (sur mobile)
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            
            // Si le menu mobile existe
            const mobileMenu = document.querySelector('.nav__list--mobile');
            if (mobileMenu) {
                mobileMenu.classList.toggle('active');
                
                // Bloquer/débloquer le scroll du body
                if (mobileMenu.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            } else {
                // Créer le menu mobile s'il n'existe pas
                createMobileMenu();
            }
        });
    }
    
    // Navigation fluide pour les liens d'ancrage
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            
            // Vérifier si c'est un lien d'ancrage interne
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Fermer le menu mobile si ouvert
                    const mobileMenu = document.querySelector('.nav__list--mobile');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        navToggle.classList.remove('active');
                        mobileMenu.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                    
                    // Scroll vers la cible avec une compensation pour le header
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Ne pas mettre à jour la classe active ici - cela sera fait par updateActiveNavOnScroll
                }
            }
        });
    });
    
	const isIndex = window.location.pathname.endsWith('/index.html')
               || window.location.pathname === '/'
               || document.querySelector('#accueil');
  if (!isIndex) return;
    // Fonction pour mettre à jour l'élément de navigation actif en fonction du défilement
    function updateActiveNavOnScroll() {
		if (!sections || !sections.length) return;
        // Obtenir la position actuelle de défilement avec une légère offset pour déclencher plus tôt
        const scrollPosition = window.scrollY + header.offsetHeight + 100;
        
        // Vérifier chaque section pour voir si elle est actuellement visible
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            // Si la position de défilement est à l'intérieur de cette section
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Supprimer la classe active de tous les liens de navigation
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    
                    // Restaurer la couleur par défaut
                    link.style.color = '';
                });
                
                // Ajouter la classe active au lien correspondant à cette section
                const activeLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
        
        // Gestion spéciale pour le défilement au tout début de la page (section d'accueil)
        if (scrollPosition < sections[0].offsetTop + 100) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.style.color = '';
            });
            
            const homeLink = document.querySelector('.nav__link[href="#accueil"]');
            if (homeLink) {
                homeLink.classList.add('active');
            }
        }
        
        // Gestion spéciale pour le défilement à la fin de la page (dernière section)
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.style.color = '';
            });
            
            const lastLink = navLinks[navLinks.length - 1];
            if (lastLink) {
                lastLink.classList.add('active');
            }
        }
    }
    
    // Assurer que l'élément de navigation correct est actif initialement
    updateActiveNavOnScroll();
    
    // Gestion du scroll sur l'indicateur de la section hero
    const scrollIndicator = document.querySelector('.hero__scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.querySelector('#prestations');
            if (nextSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = nextSection.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

/**
 * Création du menu mobile amélioré
 */
function createMobileMenu() {
    const navList = document.querySelector('.nav__list');
    const navToggle = document.querySelector('.nav__toggle');
    
    if (navList && navToggle) {
        // Vérifier si le menu mobile existe déjà
        let mobileMenu = document.querySelector('.nav__list--mobile');
        
        // Créer l'élément de menu mobile s'il n'existe pas
        if (!mobileMenu) {
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'nav__list--mobile';
            
            // AJOUT: Créer le bouton "Romain Dewasme" en haut du menu
            const headerButton = document.createElement('div');
            headerButton.className = 'nav__mobile-header';
            headerButton.innerHTML = `
                <a href="#accueil" class="nav__mobile-brand">Romain Dewasme</a>
            `;
            mobileMenu.appendChild(headerButton);
            
            // Copier les éléments du menu original
            const navItems = navList.querySelectorAll('.nav__item');
            navItems.forEach((item, index) => {
                const mobileItem = document.createElement('div');
                mobileItem.className = 'nav__item--mobile';
                mobileItem.style.setProperty('--index', index + 1); // +1 pour tenir compte du headerButton
                mobileItem.innerHTML = item.innerHTML;
                mobileMenu.appendChild(mobileItem);
            });
             const socialHTML = `
                      <div class="contact__social mobile" style="margin-top:5%;">
                           <a href="https://www.instagram.com/romaindewasme/" class="contact__social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                               <img src="assets/icons/instagram.svg" alt="Instagram">
                           </a>
                           <a href="https://www.facebook.com/p/Romain-Dewasme-100086124984675/" class="contact__social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                               <img src="assets/icons/facebook.svg" alt="Facebook">
                           </a>                        
                      </div>`;
                      mobileMenu.insertAdjacentHTML('beforeend', socialHTML);
            // Ajouter le menu mobile directement au body
            document.body.appendChild(mobileMenu);
            
            // NOUVEAU: Ajouter le gestionnaire pour fermer le menu en cliquant en dehors
            mobileMenu.addEventListener('click', (e) => {
                // Si on clique directement sur le conteneur du menu (et non sur un élément du menu)
                if (e.target === mobileMenu) {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // Ajouter les gestionnaires d'événements aux liens du menu mobile
            const mobileLinks = mobileMenu.querySelectorAll('.nav__link, .nav__mobile-brand');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // Si c'est le bouton du haut, faire défiler vers le haut
                    if (link.classList.contains('nav__mobile-brand')) {
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }
        
        // Activer le menu
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Initialisation des effets de scroll
 */
function initScrollEffects() {
    // Éléments à révéler au scroll
    const revealElements = document.querySelectorAll('.reveal-element:not(.revealed)');
    const revealTexts = document.querySelectorAll('.reveal-text:not(.revealed)');
    
    // Configuration de l'observateur d'intersection
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -40% 0px',
        threshold: 0.01 // 15% de l'élément doit être visible
    };
    
    // Observer les éléments à révéler
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Appliquer l'effet approprié selon la classe
                if (element.classList.contains('reveal-text')) {
                    element.classList.add('revealing');
                    
                    // Retirer la classe d'animation après l'exécution
                    setTimeout(() => {
                        element.classList.remove('revealing');
                        element.style.opacity = 1;
                    }, 1200);
                } else {
                    // Délai basé sur l'attribut data-delay
                    const delay = element.dataset.delay ? parseFloat(element.dataset.delay) * 1000 : 0;
                    
                    setTimeout(() => {
                        element.classList.add('revealed');
                    }, delay);
                }
                
                // Arrêter d'observer l'élément après l'animation
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observer chaque élément
    revealElements.forEach(element => {
        observer.observe(element);
    });
    
    revealTexts.forEach(element => {
        observer.observe(element);
    });
}


/**
 * Initialisation du slider de témoignages
 */
function initTestimonialSlider() {
    // Données des témoignages (à personnaliser)
    const testimonials = [
        {
            text: "Une soirée absolument mémorable. Nos invités en parlent encore des semaines après l'événement. Un véritable artiste qui transcende la simple performance.",
            author: "Sophie Dubois",
            title: "Directrice d'événements, Luxury Group"
        },
        {
            text: "J'ai fait appel à ses services pour notre gala annuel et le résultat a dépassé toutes nos attentes. Un professionnalisme impeccable couplé à un talent exceptionnel.",
            author: "Jean-Philippe Martin",
            title: "PDG, Innovations Tech"
        },
        {
            text: "Sa performance lors de notre mariage a créé une atmosphère magique que nous n'oublierons jamais. Nos invités étaient complètement captivés du début à la fin.",
            author: "Marie et Thomas Leroy",
            title: "Mariage privé"
        }
    ];
    
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const paginationContainer = document.querySelector('.testimonial-slider__pagination');
    const prevButton = document.querySelector('.testimonial-slider__prev');
    const nextButton = document.querySelector('.testimonial-slider__next');
    
    if (testimonialSlider && prevButton && nextButton) {
        let currentSlide = 0;
        
        // Générer les slides de témoignages
        testimonials.forEach((testimonial, index) => {
            // Ne pas recréer le premier slide qui existe déjà dans le HTML
            if (index === 0) return;
            
            const slide = document.createElement('div');
            slide.className = 'testimonial-slide';
            slide.style.display = 'none';
            slide.innerHTML = `
                <div class="testimonial-card">
                    <div class="testimonial-card__content">
                        <p class="testimonial-card__text">"${testimonial.text}"</p>
                        <div class="testimonial-card__author">
                            <div class="testimonial-card__author-info">
                                <h4 class="testimonial-card__author-name">${testimonial.author}</h4>
                                <p class="testimonial-card__author-title">${testimonial.title}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            testimonialSlider.appendChild(slide);
        });
        
        // Générer les points de pagination
        if (paginationContainer) {
            testimonials.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'testimonial-slider__pagination-dot' + (index === 0 ? ' active' : '');
                dot.addEventListener('click', () => goToSlide(index));
                paginationContainer.appendChild(dot);
            });
        }
        
        // Fonctions pour naviguer dans le slider
        const goToSlide = (index) => {
            const slides = testimonialSlider.querySelectorAll('.testimonial-slide');
            const dots = paginationContainer ? paginationContainer.querySelectorAll('.testimonial-slider__pagination-dot') : [];
            
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentSlide = index;
        };
        
        const goToPrev = () => {
            const slides = testimonialSlider.querySelectorAll('.testimonial-slide');
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(currentSlide);
        };
        
        const goToNext = () => {
            const slides = testimonialSlider.querySelectorAll('.testimonial-slide');
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
        };
        
        // Ajouter les événements de clic pour les boutons
        prevButton.addEventListener('click', goToPrev);
        nextButton.addEventListener('click', goToNext);
        
        // Rotation automatique des témoignages (optionnel)
        let slideInterval = setInterval(goToNext, 6000);
        
        // Mettre en pause la rotation automatique lors du survol
        testimonialSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        testimonialSlider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(goToNext, 6000);
        });
    }
}

/**
 * Mise à jour automatique de l'année dans le footer
 */
function initYearUpdate() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear().toString();
    }
}

/**
 * Utilitaire pour capitaliser la première lettre d'une chaîne
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const btn = document.getElementById('soundToggle');
  const section = document.getElementById('accueil');
const desktopSrc = 'assets/videos/teaser_dsktp_web_nosound.mp4';
const mobileSrc = 'assets/videos/teaser_mobile_2_web_nosound.mp4';
  const mql = window.matchMedia('(max-width: 1250px)');
  let loopCount = 0;
  let isPastSection = false;
  let hoverTimer;

  function updateButton() {
    if (!btn) return;

    const iconSrc = video.muted
      ? 'assets/icons/off.svg'
      : 'assets/icons/on.svg';

    const ariaLabel = video.muted
      ? 'Activer le son'
      : 'Désactiver le son';

    btn.innerHTML = '';
    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = ariaLabel;
    btn.appendChild(img);
    btn.setAttribute('aria-label', ariaLabel);
  }

  function initHero() {
    const src = mql.matches ? mobileSrc : desktopSrc;

    if (video.dataset.currentSrc === src) {
      updateButton();
      return;
    }

    video.dataset.currentSrc = src;
    video.src = src;
video.poster = mql.matches
  ? 'assets/images/teaser-thumbnail-mobile.webp'
  : 'assets/images/teaser-thumbnail-desktop.webp';
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.load();

    video.play().catch(err => {
      console.warn('Autoplay bloqué :', err);
    });

    updateButton();
  }

  function toggleSound() {
    video.muted = !video.muted;
    updateButton();
  }

  video.addEventListener('ended', () => {
    loopCount++;
    if (loopCount >= 1 && !video.muted) {
      video.muted = true;
      updateButton();
    }
  });

  function onScroll() {
    if (!section || !btn) return;

    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0) {
      if (!isPastSection) {
        isPastSection = true;
        btn.style.opacity = '0.25';
      }
    } else {
      if (isPastSection) {
        isPastSection = false;
        btn.style.opacity = '1';
      }
    }
  }

  if (btn) {
    btn.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      btn.style.opacity = '1';
    });

    btn.addEventListener('mouseleave', () => {
      if (isPastSection) {
        hoverTimer = setTimeout(() => {
          btn.style.opacity = '0.6667';
        }, 3000);
      }
    });

    btn.addEventListener('click', toggleSound);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  mql.addEventListener('change', initHero);

  initHero();
  onScroll();
});


