// Game mechanics for EcoFusion

document.addEventListener('DOMContentLoaded', () => {
    // Game tap mechanics
    const initializeGameMechanics = () => {
        const mainButton = document.getElementById('mainButton');
        const plantObject = document.getElementById('plantObject');
        
        if (mainButton) {
            mainButton.addEventListener('click', () => {
                // Get user data
                const user = getUserData();
                
                // Check if user has enough energy
                if (user.energy >= 5) {
                    // Deduct energy cost
                    user.energy -= 5;
                    
                    // Add reward (base reward * multiplier)
                    user.balance += 1 * user.multiplier;
                    
                    // Increment trees planted
                    user.treesPlanted += 1;
                    
                    // Play tap sound
                    AudioManager.play('tap');
                    
                    // Trigger tap animations
                    AnimationManager.tapEffects(mainButton, plantObject);
                    
                    // Provide haptic feedback if supported and enabled
                    if (user.haptic && navigator.vibrate) {
                        navigator.vibrate(20);
                    }
                    
                    // Check achievements
                    checkAchievements(user);
                    
                    // Save and update UI
                    saveUserData(user);
                    updateUI(user);
                } else {
                    // Not enough energy
                    AudioManager.play('error');
                    
                    // Show low energy animation
                    AnimationManager.showLowEnergy(mainButton);
                }
            });
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
        
        // Default user data if none exists
        return {
            balance: 0,
            energy: 100,
            multiplier: 1,
            treesPlanted: 0,
            upgrades: {},
            achievements: [],
            sound: true,
            haptic: true
        };
    };
    
    // Save user data to localStorage
    const saveUserData = (userData) => {
        localStorage.setItem('ecoFusionUser', JSON.stringify(userData));
    };
    
    // Helper function to update UI with current user data
    const updateUI = (user) => {
        // This is a simplified version - main UI updates are in main.js
        // Update balance
        const ecoPoints = document.getElementById('ecoPoints');
        if (ecoPoints) ecoPoints.textContent = user.balance;
        
        // Update energy
        const energy = document.getElementById('energy');
        const energyProgress = document.getElementById('energyProgress');
        
        if (energy) energy.textContent = user.energy;
        if (energyProgress) {
            energyProgress.style.width = `${user.energy}%`;
            
            // Update energy color based on level
            if (user.energy > 60) {
                energyProgress.className = 'energy-progress energy-high';
            } else if (user.energy > 30) {
                energyProgress.className = 'energy-progress energy-medium';
            } else {
                energyProgress.className = 'energy-progress energy-low';
            }
        }
        
        // Update game-specific stats
        const treesPlanted = document.getElementById('treesPlanted');
        const currentMultiplier = document.getElementById('currentMultiplier');
        
        if (treesPlanted) treesPlanted.textContent = user.treesPlanted;
        if (currentMultiplier) currentMultiplier.textContent = user.multiplier;
    };
    
    // Check for achievements
    const checkAchievements = (user) => {
        const achievements = [
            { id: 'first_tree', requirement: user.treesPlanted >= 1, name: 'Premier Pas' },
            { id: 'forester', requirement: user.treesPlanted >= 10, name: 'Forestier' },
            { id: 'ecologist', requirement: user.treesPlanted >= 50, name: 'Écologiste' }
        ];
        
        achievements.forEach(achievement => {
            if (achievement.requirement && !user.achievements.includes(achievement.id)) {
                unlockAchievement(user, achievement.id, achievement.name);
            }
        });
    };
    
    // Unlock achievement
    const unlockAchievement = (user, id, name) => {
        user.achievements.push(id);
        
        // Update achievement UI
        const achievementsList = document.getElementById('achievementsList');
        if (achievementsList) {
            const achievements = achievementsList.querySelectorAll('.achievement');
            
            achievements.forEach(achievement => {
                if (achievement.textContent.includes(name)) {
                    achievement.classList.remove('locked');
                    achievement.classList.add('unlocked');
                    
                    // Play achievement sound
                    AudioManager.play('achievement');
                    
                    // Show achievement notification
                    AnimationManager.showAchievementUnlock(name);
                }
            });
        }
    };
    
    // Initialize game mechanics
    initializeGameMechanics();
});
