// Main EcoFusion JavaScript file
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app configuration
    const APP_CONFIG = {
        DEMO_MODE: true,
        WITHDRAWAL_DATE: new Date('2025-03-30'),
        MAX_SAVINGS: 1000000,
        GAME_CONFIG: {
            baseReward: 1,
            energyCost: 5,
            energyRegenRate: 2,
            maxEnergy: 100,
            upgrades: {
                autoClicker: { cost: 50, interval: 1000 },
                multiplier: { cost: 100, value: 2 }
            }
        }
    };

    // Initialize user data
    let user = {
        email: '',
        balance: 0,
        energy: 100,
        energyRegenTimeout: null,
        upgrades: {},
        achievements: [],
        multiplier: 1,
        treesPlanted: 0,
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

    // Load user data from localStorage
    const loadUserData = () => {
        const savedUser = localStorage.getItem('ecoFusionUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                user = { ...user, ...parsedUser };
                console.log('User data loaded:', user);
            } catch (e) {
                console.error('Error parsing saved user data:', e);
            }
        }
    };

    // Save user data to localStorage
    const saveUserData = () => {
        localStorage.setItem('ecoFusionUser', JSON.stringify(user));
    };

    // Tab Navigation
    const initializeTabs = () => {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                
                // Play sound effect
                AudioManager.play('tab');
                
                // Provide haptic feedback if supported and enabled
                if (user.haptic && navigator.vibrate) {
                    navigator.vibrate(10);
                }
                
                // Remove active class from all buttons and tabs
                navButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked button and corresponding tab
                btn.classList.add('active');
                document.getElementById(`${tabName}Tab`).classList.add('active');
                
                // Run animations for the tab
                AnimationManager.runTabTransition(tabName);
            });
        });
    };

    // Payment Method Selection
    const initializePaymentMethods = () => {
        const paymentOptions = document.querySelectorAll('.payment-option');
        
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Play sound effect
                AudioManager.play('select');
                
                // Enable withdraw button if a payment method is selected
                const withdrawButton = document.getElementById('withdrawButton');
                if (withdrawButton) {
                    withdrawButton.classList.remove('disabled');
                    withdrawButton.disabled = false;
                }
                
                // Trigger the selection animation
                AnimationManager.pulseElement(option);
            });
        });
    };

    // Initialize task checkboxes
    const initializeTasks = () => {
        const taskCheckboxes = document.querySelectorAll('.task-checkbox');
        
        taskCheckboxes.forEach(checkbox => {
            const taskId = checkbox.getAttribute('data-task-id');
            
            // Check if task is already completed
            if (user.tasks.completed.includes(taskId)) {
                checkbox.classList.add('checked');
            }
            
            checkbox.addEventListener('click', () => {
                if (!checkbox.classList.contains('checked')) {
                    checkbox.classList.add('checked');
                    
                    // Add task to completed tasks
                    user.tasks.completed.push(taskId);
                    
                    // Add reward (hardcoded for now, would come from server in real app)
                    const reward = 15;
                    user.balance += reward;
                    
                    // Play sound effect
                    AudioManager.play('complete');
                    
                    // Provide haptic feedback
                    if (user.haptic && navigator.vibrate) {
                        navigator.vibrate([15, 10, 15]);
                    }
                    
                    // Show reward animation
                    AnimationManager.showReward(checkbox, reward);
                    
                    // Update user interface
                    updateUI();
                    
                    // Save user data
                    saveUserData();
                }
            });
        });

        // Initialize daily challenge button
        const completeDaily = document.getElementById('completeDaily');
        if (completeDaily) {
            completeDaily.addEventListener('click', () => {
                // Add reward for daily challenge
                const reward = 25;
                user.balance += reward;
                
                // Play sound effect
                AudioManager.play('achievement');
                
                // Show reward animation
                AnimationManager.showReward(completeDaily, reward);
                
                // Disable button after completion
                completeDaily.disabled = true;
                completeDaily.classList.add('disabled');
                completeDaily.innerHTML = '<i class="fas fa-check-circle"></i> Complété!';
                
                // Update user interface
                updateUI();
                
                // Save user data
                saveUserData();
            });
        }
    };

    // Initialize upgrade buttons
    const initializeUpgrades = () => {
        const buyMultiplier = document.getElementById('buyMultiplier');
        const buyAutoClicker = document.getElementById('buyAutoClicker');
        
        if (buyMultiplier) {
            buyMultiplier.addEventListener('click', () => {
                if (user.balance >= APP_CONFIG.GAME_CONFIG.upgrades.multiplier.cost) {
                    // Deduct cost
                    user.balance -= APP_CONFIG.GAME_CONFIG.upgrades.multiplier.cost;
                    
                    // Apply upgrade
                    user.multiplier *= APP_CONFIG.GAME_CONFIG.upgrades.multiplier.value;
                    
                    // Play sound effect
                    AudioManager.play('upgrade');
                    
                    // Show upgrade animation
                    AnimationManager.showUpgradeEffect(buyMultiplier);
                    
                    // Update UI
                    updateUI();
                    
                    // Save user data
                    saveUserData();
                } else {
                    // Play error sound
                    AudioManager.play('error');
                    
                    // Show insufficient funds animation
                    AnimationManager.showInsufficientFunds(buyMultiplier);
                }
            });
        }
        
        if (buyAutoClicker) {
            buyAutoClicker.addEventListener('click', () => {
                if (user.balance >= APP_CONFIG.GAME_CONFIG.upgrades.autoClicker.cost) {
                    // Deduct cost
                    user.balance -= APP_CONFIG.GAME_CONFIG.upgrades.autoClicker.cost;
                    
                    // Apply upgrade (in a real app, this would be more sophisticated)
                    if (!user.upgrades.autoClicker) {
                        user.upgrades.autoClicker = { level: 1 };
                        
                        // Start auto-clicking
                        setInterval(() => {
                            if (user.energy >= APP_CONFIG.GAME_CONFIG.energyCost) {
                                // Auto tap functionality
                                user.balance += APP_CONFIG.GAME_CONFIG.baseReward * user.multiplier;
                                user.energy -= APP_CONFIG.GAME_CONFIG.energyCost;
                                user.treesPlanted += 1;
                                
                                // Update UI
                                updateUI();
                                
                                // Check achievements
                                checkAchievements();
                            }
                        }, APP_CONFIG.GAME_CONFIG.upgrades.autoClicker.interval);
                    } else {
                        user.upgrades.autoClicker.level += 1;
                    }
                    
                    // Play sound effect
                    AudioManager.play('upgrade');
                    
                    // Show upgrade animation
                    AnimationManager.showUpgradeEffect(buyAutoClicker);
                    
                    // Update UI
                    updateUI();
                    
                    // Save user data
                    saveUserData();
                } else {
                    // Play error sound
                    AudioManager.play('error');
                    
                    // Show insufficient funds animation
                    AnimationManager.showInsufficientFunds(buyAutoClicker);
                }
            });
        }
    };

    // Initialize sound toggle
    const initializeSoundToggle = () => {
        const soundToggle = document.getElementById('soundToggle');
        const soundIcon = document.getElementById('soundIcon');
        
        // Set initial state
        if (!user.sound) {
            soundIcon.classList.remove('fa-volume-up');
            soundIcon.classList.add('fa-volume-mute');
        }
        
        soundToggle.addEventListener('click', () => {
            user.sound = !user.sound;
            
            if (user.sound) {
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
                AudioManager.play('ui');
            } else {
                soundIcon.classList.remove('fa-volume-up');
                soundIcon.classList.add('fa-volume-mute');
            }
            
            // Save user preference
            saveUserData();
        });
    };
    
    // Initialize social missions
    const initializeSocialMissions = () => {
        // Initialize social data if not exists
        if (!user.socialMissions) {
            user.socialMissions = {
                completed: [],
                totalPoints: 0
            };
            saveUserData();
        }
        
        // Get all social buttons
        const socialButtons = document.querySelectorAll('.social-btn');
        
        // Mark already completed social missions
        socialButtons.forEach(button => {
            const socialId = button.getAttribute('data-social-id');
            
            if (user.socialMissions.completed.includes(socialId)) {
                button.innerHTML = '<i class="fas fa-check"></i> Complété';
                button.classList.add('completed');
                button.closest('.social-card').classList.add('completed');
            }
            
            // Add click handlers to social buttons
            button.addEventListener('click', () => {
                const socialCard = button.closest('.social-card');
                const url = socialCard.getAttribute('data-url');
                const points = parseInt(socialCard.getAttribute('data-points'));
                
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
                            updateSocialProgress();
                            
                            // Update general UI
                            updateUI();
                            
                            // Save user data
                            saveUserData();
                            
                            // Check if all social missions are completed
                            checkAllSocialMissionsCompleted();
                        }
                    }, 1000);
                }
            });
        });
        
        // Update social progress on init
        updateSocialProgress();
    };
    
    // Update the social progress display
    const updateSocialProgress = () => {
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
    
    // Check if all social missions are completed
    const checkAllSocialMissionsCompleted = () => {
        const socialButtons = document.querySelectorAll('.social-btn');
        const totalSocialMissions = socialButtons.length;
        
        if (user.socialMissions?.completed.length === totalSocialMissions) {
            // Achievement for completing all social missions
            if (!user.achievements.includes('social_master')) {
                unlockAchievement('social_master', 'Maître des Réseaux');
                
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
                
                // Hide after delay
                setTimeout(() => {
                    notification.style.animation = 'fadeOut 0.5s forwards';
                    setTimeout(() => {
                        notification.remove();
                    }, 500);
                }, 5000);
            }
        }
    };

    // Check for achievements
    const checkAchievements = () => {
        // First tree planted
        if (user.treesPlanted >= 1 && !user.achievements.includes('first_tree')) {
            unlockAchievement('first_tree', 'Premier Pas');
        }
        
        // 10 trees planted
        if (user.treesPlanted >= 10 && !user.achievements.includes('forester')) {
            unlockAchievement('forester', 'Forestier');
        }
        
        // 50 trees planted
        if (user.treesPlanted >= 50 && !user.achievements.includes('ecologist')) {
            unlockAchievement('ecologist', 'Écologiste');
        }
    };

    // Unlock achievement
    const unlockAchievement = (id, name) => {
        user.achievements.push(id);
        
        // Update achievement UI
        const achievementsList = document.getElementById('achievementsList');
        const achievements = achievementsList.querySelectorAll('.achievement');
        
        achievements.forEach(achievement => {
            if (achievement.textContent.includes(name)) {
                achievement.classList.remove('locked');
                achievement.classList.add('unlocked');
            }
        });
        
        // Play achievement sound
        AudioManager.play('achievement');
        
        // Show achievement notification
        AnimationManager.showAchievementUnlock(name);
        
        // Save user data
        saveUserData();
    };

    // Update all UI elements with current user data
    const updateUI = () => {
        // Update balance displays
        const balanceElements = document.querySelectorAll('#ecoPoints, #financeEcoPoints, #withdrawablePoints');
        balanceElements.forEach(el => {
            if (el) el.textContent = user.balance;
        });
        
        // Update energy display
        const energyText = document.getElementById('energy');
        const energyProgress = document.getElementById('energyProgress');
        
        if (energyText) energyText.textContent = user.energy;
        if (energyProgress) {
            energyProgress.style.width = `${user.energy}%`;
            
            // Update energy progress bar color based on energy level
            if (user.energy > 60) {
                energyProgress.className = 'energy-progress energy-high';
            } else if (user.energy > 30) {
                energyProgress.className = 'energy-progress energy-medium';
            } else {
                energyProgress.className = 'energy-progress energy-low';
            }
        }
        
        // Update game stats
        const treesPlanted = document.getElementById('treesPlanted');
        const currentMultiplier = document.getElementById('currentMultiplier');
        
        if (treesPlanted) treesPlanted.textContent = user.treesPlanted;
        if (currentMultiplier) currentMultiplier.textContent = user.multiplier;
        
        // Update withdraw date
        const withdrawDate = document.getElementById('withdrawDate');
        if (withdrawDate) {
            const dateString = APP_CONFIG.WITHDRAWAL_DATE.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            withdrawDate.textContent = dateString;
        }
        
        // Update carbon impact (simple calculation for demo)
        const carbonImpact = document.getElementById('carbonImpact');
        if (carbonImpact) {
            const impact = (user.treesPlanted * 0.5).toFixed(1);
            carbonImpact.textContent = impact;
        }
        
        // Update social missions progress
        const socialPoints = document.getElementById('socialPoints');
        const socialProgressFill = document.getElementById('socialProgressFill');
        
        if (socialPoints && socialProgressFill) {
            const totalPoints = user.socialMissions?.totalPoints || 0;
            const maxPoints = 100; // Total points possible from social missions
            const percentage = Math.min(100, (totalPoints / maxPoints) * 100);
            
            socialPoints.textContent = totalPoints;
            socialProgressFill.style.width = `${percentage}%`;
        }
    };

    // Energy regeneration system
    const startEnergyRegen = () => {
        // Clear any existing timeout
        if (user.energyRegenTimeout) {
            clearTimeout(user.energyRegenTimeout);
        }
        
        // Set up energy regeneration
        user.energyRegenTimeout = setInterval(() => {
            if (user.energy < 100) {
                user.energy = Math.min(user.energy + APP_CONFIG.GAME_CONFIG.energyRegenRate, 100);
                updateUI();
            }
        }, 1000);
    };

    // Initialize the application
    const initialize = () => {
        console.log('Initializing EcoFusion application...');
        
        // Load user data from localStorage
        loadUserData();
        
        // Hide preloader with animation after 1 second
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }
        }, 1000);
        
        // Initialize components
        initializeTabs();
        initializePaymentMethods();
        initializeTasks();
        initializeUpgrades();
        initializeSoundToggle();
        initializeSocialMissions();
        
        // Start energy regeneration
        startEnergyRegen();
        
        // Update UI with initial data
        updateUI();
        
        // Auto-save user data every 5 seconds
        setInterval(saveUserData, 5000);
        
        // Play welcome sound
        setTimeout(() => {
            AudioManager.play('welcome');
        }, 1200);
    };

    // Run initialization
    initialize();
});
