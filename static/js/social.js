// Social missions management for EcoFusion
document.addEventListener('DOMContentLoaded', () => {
    // Initialize social missions functionality
    const initializeSocialMissions = () => {
        // Get all social buttons
        const socialButtons = document.querySelectorAll('.social-btn');
        
        // Load user data
        let user = getUserData();
        
        // Initialize social data if not exists
        if (!user.socialMissions) {
            user.socialMissions = {
                completed: [],
                totalPoints: 0
            };
            saveUserData(user);
        }
        
        // Update social progress display
        updateSocialProgress(user);
        
        // Mark already completed social missions
        markCompletedSocialMissions(user);
        
        // Add click handlers to social buttons
        socialButtons.forEach(button => {
            const socialId = button.getAttribute('data-social-id');
            const socialCard = button.closest('.social-card');
            const url = socialCard.getAttribute('data-url');
            const points = parseInt(socialCard.getAttribute('data-points'));
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Only process if not already completed
                if (!user.socialMissions.completed.includes(socialId)) {
                    // Open the social media link in a new tab
                    window.open(url, '_blank');
                    
                    // Show confirmation dialog
                    setTimeout(() => {
                        const confirmed = confirm("Avez-vous suivi cette chaîne sociale? Si oui, vous recevrez les points de récompense.");
                        
                        if (confirmed) {
                            // Add to completed missions
                            user.socialMissions.completed.push(socialId);
                            
                            // Add points to user balance
                            user.balance += points;
                            user.socialMissions.totalPoints += points;
                            
                            // Play achievement sound
                            AudioManager.play('achievement');
                            
                            // Update UI with animations
                            button.innerHTML = '<i class="fas fa-check"></i> Complété';
                            button.classList.add('completed');
                            socialCard.classList.add('completed');
                            
                            // Show points animation
                            AnimationManager.showReward(button, points);
                            
                            // Update social progress 
                            updateSocialProgress(user);
                            
                            // Update general UI
                            updateUI(user);
                            
                            // Save user data
                            saveUserData(user);
                            
                            // Check if all social missions are completed
                            checkAllSocialMissionsCompleted(user);
                        }
                    }, 1000);
                }
            });
        });
    };
    
    // Update the social progress display
    const updateSocialProgress = (user) => {
        const socialPoints = document.getElementById('socialPoints');
        const socialProgressFill = document.getElementById('socialProgressFill');
        
        if (socialPoints && socialProgressFill) {
            const totalPoints = user.socialMissions?.totalPoints || 0;
            const maxPoints = 100; // Total points possible from social missions
            const percentage = Math.min(100, (totalPoints / maxPoints) * 100);
            
            socialPoints.textContent = totalPoints;
            socialProgressFill.style.width = `${percentage}%`;
            
            // Add animation for progress updates
            socialProgressFill.style.animation = 'none';
            socialProgressFill.offsetHeight; // Trigger reflow
            socialProgressFill.style.animation = 'pulse 2s';
        }
    };
    
    // Mark already completed social missions in UI
    const markCompletedSocialMissions = (user) => {
        if (!user.socialMissions?.completed) return;
        
        const socialButtons = document.querySelectorAll('.social-btn');
        
        socialButtons.forEach(button => {
            const socialId = button.getAttribute('data-social-id');
            
            if (user.socialMissions.completed.includes(socialId)) {
                button.innerHTML = '<i class="fas fa-check"></i> Complété';
                button.classList.add('completed');
                button.closest('.social-card').classList.add('completed');
            }
        });
    };
    
    // Check if all social missions are completed
    const checkAllSocialMissionsCompleted = (user) => {
        const socialButtons = document.querySelectorAll('.social-btn');
        const totalSocialMissions = socialButtons.length;
        
        if (user.socialMissions?.completed.length === totalSocialMissions) {
            // Create achievement notification
            const notification = document.createElement('div');
            notification.className = 'social-achievement-notification';
            notification.innerHTML = `
                <i class="fas fa-award"></i>
                <div>
                    <h4>Mission accomplie !</h4>
                    <p>Vous avez complété toutes les missions sociales</p>
                </div>
            `;
            
            // Style the notification
            Object.assign(notification.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(46, 204, 113, 0.9)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                zIndex: '1000',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                animation: 'fadeIn 0.5s, pulse 2s infinite'
            });
            
            // Style the icon
            const icon = notification.querySelector('i');
            Object.assign(icon.style, {
                fontSize: '40px',
                color: 'var(--premium-color)'
            });
            
            // Add to DOM
            document.body.appendChild(notification);
            
            // Play special achievement sound
            AudioManager.play('achievement');
            
            // Hide after delay
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.5s forwards';
                setTimeout(() => {
                    notification.remove();
                }, 500);
            }, 5000);
        }
    };
    
    // Get user data from localStorage
    const getUserData = () => {
        try {
            const savedData = localStorage.getItem('ecoFusionUser');
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (e) {
            console.error('Error getting user data:', e);
        }
        
        return {
            balance: 0,
            energy: 100,
            multiplier: 1,
            treesPlanted: 0,
            upgrades: {},
            achievements: [],
            tasks: {
                completed: []
            },
            socialMissions: {
                completed: [],
                totalPoints: 0
            },
            sound: true,
            haptic: true
        };
    };
    
    // Save user data to localStorage
    const saveUserData = (userData) => {
        localStorage.setItem('ecoFusionUser', JSON.stringify(userData));
    };
    
    // Update the main UI with current user data
    const updateUI = (user) => {
        // Update balance displays
        const balanceElements = document.querySelectorAll('#ecoPoints, #financeEcoPoints, #withdrawablePoints');
        balanceElements.forEach(el => {
            if (el) el.textContent = user.balance;
        });
    };
    
    // Initialize social missions
    initializeSocialMissions();
});