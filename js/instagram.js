/**
 * INSTAGRAM INTEGRATION
 * Site web magicien
 * Intégration du flux Instagram
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le flux Instagram
    initInstagramFeed();
});

/**
 * Initialisation du flux Instagram
 * Note: Pour une version de production, vous devrez utiliser soit:
 * 1. L'API Instagram Graph (nécessite un compte business et une approbation Facebook)
 * 2. Un service tiers comme EmbedSocial, Curator.io, etc.
 * 3. Un accès token Instagram qui devra être renouvelé régulièrement
 * 
 * Cette version est une simulation à des fins de démo qui utilise des images locales
 */
function initInstagramFeed() {
    const instagramContainer = document.querySelector('.instagram-feed__container');
    
    if (instagramContainer) {
        // Données simulées pour la démo (à remplacer par l'API réelle)
        const instagramPosts = [
            {
                image: 'assets/images/instagram/post1.jpg',
                link: 'https://www.instagram.com/p/DExIkm_CYkk/',
                caption: 'Performance exclusive au Château de Versailles #magie #prestige'
            },
            {
                image: 'assets/images/instagram/post2.jpg',
                link: 'https://instagram.com/p/example2',
                caption: 'Quand la magie rencontre l\'art culinaire #diner #experience'
            },
            {
                image: 'assets/images/instagram/post3.jpg',
                link: 'https://instagram.com/p/example3',
                caption: 'Nouvelle illusion en préparation #comingsoon #creation'
            },
            {
                image: 'assets/images/instagram/post4.jpg',
                link: 'https://instagram.com/p/example4',
                caption: 'Soirée corporate exceptionnelle #evenement #magie'
            },
            {
                image: 'assets/images/instagram/post5.jpg',
                link: 'https://instagram.com/p/example5',
                caption: 'Les coulisses de la magie #behindthescenes #preparation'
            },
            {
                image: 'assets/images/instagram/post6.jpg',
                link: 'https://instagram.com/p/example6',
                caption: 'L\'art de l\'illusion #closeup #cartes'
            }
        ];
        
        // Générer les éléments du flux Instagram
        instagramPosts.forEach(post => {
            const postElement = document.createElement('a');
            postElement.className = 'instagram-feed__item';
            postElement.href = post.link;
            postElement.target = '_blank';
            postElement.rel = 'noopener noreferrer';
            postElement.setAttribute('aria-label', post.caption);
            
            postElement.innerHTML = `
                <img src="${post.image}" alt="${post.caption}" class="instagram-feed__img" loading="lazy">
            `;
            
            instagramContainer.appendChild(postElement);
        });
    }
}

/**
 * Configuration pour l'intégration de l'API Instagram Graph réelle
 * Note: Décommentez et personnalisez ce code lorsque vous êtes prêt à utiliser l'API réelle
 */
/*
function initRealInstagramFeed() {
    // Votre access token Instagram (à obtenir via Facebook Developer)
    const accessToken = 'YOUR_INSTAGRAM_ACCESS_TOKEN';
    const userId = 'YOUR_INSTAGRAM_USER_ID';
    const numPosts = 6; // Nombre de posts à afficher
    
    const endpoint = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${accessToken}&limit=${numPosts}`;
    
    // Récupérer les données depuis l'API Instagram
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            const instagramContainer = document.querySelector('.instagram-feed__container');
            
            if (instagramContainer && data.data) {
                // Vider le conteneur
                instagramContainer.innerHTML = '';
                
                // Remplir avec les vrais posts Instagram
                data.data.forEach(post => {
                    // Vérifier si c'est une image (ignorer les vidéos pour garder l'interface cohérente)
                    if (post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM') {
                        const imageUrl = post.media_url;
                        const postLink = post.permalink;
                        const caption = post.caption ? post.caption.substring(0, 100) + '...' : '';
                        
                        const postElement = document.createElement('a');
                        postElement.className = 'instagram-feed__item';
                        postElement.href = postLink;
                        postElement.target = '_blank';
                        postElement.rel = 'noopener noreferrer';
                        postElement.setAttribute('aria-label', caption);
                        
                        postElement.innerHTML = `
                            <img src="${imageUrl}" alt="${caption}" class="instagram-feed__img" loading="lazy">
                        `;
                        
                        instagramContainer.appendChild(postElement);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du flux Instagram:', error);
            // Utiliser les posts de démonstration en cas d'erreur
            initInstagramFeed();
        });
}
*/

/**
 * Alternative avec l'API oEmbed (nécessite un site web public)
 * Cette approche ne nécessite pas d'access token mais uniquement un site web public
 */
/*
function initInstagramOEmbed() {
    // Les URLs de vos posts Instagram
    const instagramUrls = [
        'https://www.instagram.com/p/EXAMPLE_POST_1/',
        'https://www.instagram.com/p/EXAMPLE_POST_2/',
        'https://www.instagram.com/p/EXAMPLE_POST_3/',
        'https://www.instagram.com/p/EXAMPLE_POST_4/',
        'https://www.instagram.com/p/EXAMPLE_POST_5/',
        'https://www.instagram.com/p/EXAMPLE_POST_6/'
    ];
    
    const instagramContainer = document.querySelector('.instagram-feed__container');
    
    if (instagramContainer) {
        // Vider le conteneur
        instagramContainer.innerHTML = '';
        
        // Ajouter chaque post avec oEmbed
        instagramUrls.forEach(url => {
            const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&hidecaption=true&maxwidth=300`;
            
            fetch(oembedUrl)
                .then(response => response.json())
                .then(data => {
                    const postElement = document.createElement('div');
                    postElement.className = 'instagram-feed__item';
                    postElement.innerHTML = data.html;
                    instagramContainer.appendChild(postElement);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération du post Instagram:', error);
                });
        });
    }
}
*/
