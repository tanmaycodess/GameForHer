import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Gauge, Settings, User, Heart, Star, Trophy, Play, Volume2, VolumeX, Gamepad2, KeyRound, Crown } from 'lucide-react';
import { Joystick } from 'react-joystick-component';
import BG1 from '../assets/BG1.jpg';
import BG2 from '../assets/BG2.jpg';
import BG3 from '../assets/BG3.jpg';
import She from '../assets/she.jpg';
import ME from '../assets/ME.png';
import US from '../assets/US.jpg'
import AchievementNotification from './Achievement';


const MovementGame = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [useJoystick, setUseJoystick] = useState(true);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [movementSpeed, setMovementSpeed] = useState(10);
    const [difficulty, setDifficulty] = useState('normal');
    const [isImmune, setIsImmune] = useState(false);
    const [powerUps, setPowerUps] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [lives, setLives] = useState(3);
    const [highScore, setHighScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [combo, setCombo] = useState(0);
    const [achievements, setAchievements] = useState([]);
    const [powerUpActive, setPowerUpActive] = useState(false);

    // New state for special effects
    const [showPowerUpEffect, setShowPowerUpEffect] = useState(false);
    const [showComboEffect, setShowComboEffect] = useState(false);

    const backgrounds = [
        { name: "BG1", image: BG1 },
        { name: "BG2", image: BG2 },
        { name: "BG3", image: BG3 }
    ];

    const baseObstacles = [
        { x: 100, y: 100, speedX: 1, speedY: 0, pattern: 'horizontal', name: 'GHARWALE', width: 40, height: 40, icon: User, color: 'text-red-500', direction: 1 },
        { x: 200, y: 150, speedX: 0, speedY: 1, pattern: 'vertical', name: 'ADITYA', width: 40, height: 40, icon: User, color: 'text-blue-500', direction: 1 },
        { x: 50, y: 200, speedX: 1, speedY: 1, pattern: 'circular', name: 'ANANT', width: 40, height: 40, icon: User, color: 'text-green-500', direction: 1 },
        { x: 250, y: 50, speedX: 2, speedY: 0, pattern: 'zigzag', name: 'AKSHIT', width: 40, height: 40, icon: User, color: 'text-purple-500', direction: 1 },
        { x: 150, y: 300, speedX: 1.5, speedY: 1.5, pattern: 'sine', name: 'RELATIVE', width: 40, height: 40, icon: User, color: 'text-yellow-500', direction: 1 },
        { x: 300, y: 200, speedX: 2, speedY: 1, pattern: 'bounce', name: 'FRIEND', width: 40, height: 40, icon: User, color: 'text-pink-500', direction: 1 }
    ];

     const [obstacles, setObstacles] = useState([]);

    const [selectedBackground, setSelectedBackground] = useState(backgrounds[0].image);


    const staticMessage = "Baby i developed this game to let you know , ke i'll always be there for you and i'll always be your safe place protecting you from everyone ";

    const experienceNeeded = level * 1000;

    // First, add a useEffect for obstacle movement and collision detection:

    useEffect(() => {
        if (!gameStarted) return;

        const settings = difficultySettings[difficulty];
        const obstacleCount = Math.min(settings.obstacleCount, baseObstacles.length);
        const selectedObstacles = baseObstacles.slice(0, obstacleCount);

        setObstacles(
            selectedObstacles.map(obstacle => ({
                ...obstacle,
                speedX: obstacle.speedX * settings.multiplier,
                speedY: obstacle.speedY * settings.multiplier,
            }))
        );
    }, [difficulty, gameStarted]);

    // Fixed game loop with proper collision detection
    useEffect(() => {
        if (gameOver || !gameStarted || obstacles.length === 0) return; // Ensure obstacles exist

        const gameLoop = setInterval(() => {
            setObstacles(prevObstacles => {
                return prevObstacles.map(obstacle => {
                    let { x, y, speedX, speedY, pattern, direction, width, height } = obstacle;

                    switch (pattern) {
                        case 'horizontal':
                            x += speedX * direction;
                            if (x <= 0 || x >= gameSize - width) direction *= -1;
                            break;
                        case 'vertical':
                            y += speedY * direction;
                            if (y <= 0 || y >= gameSize - height) direction *= -1;
                            break;
                        case 'circular': {
                            const centerX = gameSize / 2;
                            const centerY = gameSize / 2;
                            const radius = 100;
                            const angle = (Date.now() / 1000) * speedX;
                            x = centerX + Math.cos(angle) * radius;
                            y = centerY + Math.sin(angle) * radius;
                            break;
                        }
                        case 'zigzag':
                            x += speedX * direction;
                            y += speedY * Math.sin(Date.now() / 500);
                            if (x <= 0 || x >= gameSize - width) direction *= -1;
                            break;
                        default:
                            break;
                    }

                    return { ...obstacle, x, y, direction };
                });
            });

            // 🛠 Ensure obstacles are not accessed before they exist
            if (!isImmune && obstacles.length > 0) {
                const playerCenterX = position.x;
                const playerCenterY = position.y;
                const playerRadius = playerSize / 2;

                obstacles.forEach(obstacle => {
                    const obstacleCenterX = obstacle.x + obstacle.width / 2;
                    const obstacleCenterY = obstacle.y + obstacle.height / 2;
                    const obstacleRadius = Math.max(obstacle.width, obstacle.height) / 2;

                    const dx = playerCenterX - obstacleCenterX;
                    const dy = playerCenterY - obstacleCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < playerRadius + obstacleRadius) {
                        handleCollision();
                    }
                });
            }
        }, 16);

        return () => clearInterval(gameLoop);
    }, [gameOver, position, isImmune, gameStarted, obstacles.length]); // ✅ Prevents referencing obstacles before initialization


    // Fixed power-up generation
    useEffect(() => {
        if (gameOver || !gameStarted) return;

        const generatePowerUp = () => {
            const powerUpTypes = ['immunity', 'speed', 'extraLife', 'scoreBoost'];
            const newPowerUp = {
                x: Math.random() * (gameSize - 40), // Adjusted for power-up size
                y: Math.random() * (gameSize - 40),
                type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
            };
            setPowerUps(current => [...current, newPowerUp]);
        };

        const settings = difficultySettings[difficulty];
        const powerUpInterval = setInterval(generatePowerUp, settings.powerUpFrequency);
        return () => clearInterval(powerUpInterval);
    }, [gameOver, difficulty, gameStarted]);

    // Fixed power-up collection detection
    useEffect(() => {
        if (gameOver || !gameStarted) return;

        const checkPowerUpCollisions = () => {
            setPowerUps(current => {
                const remaining = [];
                current.forEach(powerUp => {
                    const dx = position.x - powerUp.x;
                    const dy = position.y - powerUp.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < playerSize / 2 + 20) {
                        handlePowerUpCollection(powerUp);
                    } else {
                        remaining.push(powerUp);
                    }
                });
                return remaining;
            });
        };

        const collisionCheck = setInterval(checkPowerUpCollisions, 100);
        return () => clearInterval(collisionCheck);
    }, [position, gameOver, gameStarted]);

    // Fixed keyboard controls
    useEffect(() => {
        if (gameOver || !gameStarted) return;

        const handleKeyPress = (e) => {
            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    move('up');
                    break;
                case 'arrowdown':
                case 's':
                    move('down');
                    break;
                case 'arrowleft':
                case 'a':
                    move('left');
                    break;
                case 'arrowright':
                case 'd':
                    move('right');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameOver, gameStarted]);



    // Fixed move function with proper boundary checking
    const move = (direction, speedFactor = 1) => {
        if (gameOver || !gameStarted) return;

        setPosition(prev => {
            const newPos = { ...prev };
            const speed = (powerUpActive ? movementSpeed * 1.5 : movementSpeed) * speedFactor; // Apply speed factor

            switch (direction) {
                case 'up':
                    newPos.y = Math.max(playerSize / 2, prev.y - speed);
                    break;
                case 'down':
                    newPos.y = Math.min(gameSize - playerSize / 2, prev.y + speed);
                    break;
                case 'left':
                    newPos.x = Math.max(playerSize / 2, prev.x - speed);
                    break;
                case 'right':
                    newPos.x = Math.min(gameSize - playerSize / 2, prev.x + speed);
                    break;
                default:
                    return prev;
            }

            // Update score and combo
            const points = Math.ceil(10 * (1 + combo * 0.1));
            setScore(s => s + points);
            setCombo(c => c + 1);
            setExperience(e => e + points * difficultySettings[difficulty].experienceMultiplier);

            if (combo > 0 && combo % 10 === 0) {
                setShowComboEffect(true);
                setTimeout(() => setShowComboEffect(false), 1000);
            }

            checkAchievements();
            return newPos;
        });
    };


    // Fixed collision handler
    const handleCollision = () => {
        if (isImmune) return;

        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                setGameOver(true);
                if (score > highScore) {
                    setHighScore(score);
                }
            } else {
                setIsImmune(true);
                setTimeout(() => setIsImmune(false), 2000);
            }
            return newLives;
        });

        setCombo(0);
        if (!isMuted) {
            // Play sound effect here
        }
    };


    // Fixed power-up collection handler
    const handlePowerUpCollection = (powerUp) => {
        if (!isMuted) {
            // Play power-up sound
        }

        setShowPowerUpEffect(true);
        setTimeout(() => setShowPowerUpEffect(false), 1000);

        switch (powerUp.type) {
            case 'immunity':
                setIsImmune(true);
                setPowerUpActive(true);
                setTimeout(() => {
                    setIsImmune(false);
                    setPowerUpActive(false);
                }, 5000);
                break;
            case 'speed':
                setMovementSpeed(prev => {
                    const newSpeed = prev * 1.5;
                    setTimeout(() => setMovementSpeed(prev), 5000);
                    return Math.min(newSpeed, 30);
                });
                break;
            case 'extraLife':
                setLives(prev => Math.min(prev + 1, 5));
                break;
            case 'scoreBoost':
                setScore(prev => prev + 100);
                break;
            default:
                break;
        }
    };

    // Fixed achievement check
    const checkAchievements = () => {
        const newAchievements = [];

        if (score > 1000 && !achievements.includes('scorer')) {
            newAchievements.push('scorer');
        }

        if (combo > 10 && !achievements.includes('combo')) {
            newAchievements.push('combo');
        }

        if (newAchievements.length > 0) {
            setAchievements(prev => [...prev, ...newAchievements]);
            newAchievements.forEach(achievement => {
                showNotification(`Achievement Unlocked: ${achievement}`);
            });
        }
    };

    // Fixed notification system
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };

    // Fixed game reset (continued)
    const resetGame = () => {
        setPosition({ x: 50, y: 50 });
        setScore(0);
        setGameOver(false);
        setMovementSpeed(10);
        setIsImmune(false);
        setPowerUps([]);
        setLives(3);
        setCombo(0);
        setPowerUpActive(false);
        setExperience(0);
        setGameStarted(true);

        // Reset obstacles based on current difficulty
        const settings = difficultySettings[difficulty];
        const obstacleCount = Math.min(settings.obstacleCount, baseObstacles.length);
        const selectedObstacles = baseObstacles.slice(0, obstacleCount);

        setObstacles(selectedObstacles.map(obstacle => ({
            ...obstacle,
            speedX: obstacle.speedX * settings.multiplier,
            speedY: obstacle.speedY * settings.multiplier
        })));
    };

    const difficultySettings = {
        easy: {
            multiplier: 1,
            obstacleCount: 4,
            powerUpFrequency: 7000,
            experienceMultiplier: 1
        },
        normal: {
            multiplier: 1.5,
            obstacleCount: 6,
            powerUpFrequency: 5000,
            experienceMultiplier: 1.5
        },
        hard: {
            multiplier: 2.5,
            obstacleCount: 8,
            powerUpFrequency: 3000,
            experienceMultiplier: 2
        }
    };

   

   

    const gameSize = 600;
    const playerSize = 45;

    useEffect(() => {
        const settings = difficultySettings[difficulty] || difficultySettings['normal']; // Default to 'normal'

        let obstacleCount = settings?.obstacleCount ?? baseObstacles.length;
        const multiplier = settings?.multiplier ?? 1;

        // Ensure `obstacleCount` is a valid number
        if (isNaN(obstacleCount) || obstacleCount < 0 || obstacleCount > baseObstacles.length) {
            console.error("Invalid obstacleCount, setting to default:", obstacleCount);
            obstacleCount = Math.min(6, baseObstacles.length); // Default to 6 obstacles
        }

        const selectedObstacles = baseObstacles.slice(0, obstacleCount);

        setObstacles(
            selectedObstacles.map(obstacle => ({
                ...obstacle,
                speedX: obstacle.speedX * multiplier,
                speedY: obstacle.speedY * multiplier,
            }))
        );
    }, [difficulty]);




    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    move('up');
                    break;
                case 'ArrowDown':
                case 's':
                    move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                    move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                    move('right');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameOver]);

    useEffect(() => {
        if (gameOver) return;

        const generatePowerUp = () => {
            const powerUpTypes = ['immunity', 'speed', 'extraLife', 'scoreBoost'];
            const newPowerUp = {
                x: Math.random() * (gameSize - 20),
                y: Math.random() * (gameSize - 20),
                type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
            };
            setPowerUps(current => [...current, newPowerUp]);
        };

        const settings = difficultySettings[difficulty];
        const powerUpInterval = setInterval(generatePowerUp, settings.powerUpFrequency);
        return () => clearInterval(powerUpInterval);
    }, [gameOver, difficulty]);


    useEffect(() => {
        if (gameOver || !gameStarted) return;

        powerUps.forEach(powerUp => {
            const playerCenterX = position.x + playerSize / 2;
            const playerCenterY = position.y + playerSize / 2;
            const powerUpCenterX = powerUp.x + 10; // Assuming power-ups are 20x20px
            const powerUpCenterY = powerUp.y + 10;

            const dx = playerCenterX - powerUpCenterX;
            const dy = playerCenterY - powerUpCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < playerSize / 2 + 10) { // If player overlaps power-up
                handlePowerUpCollection(powerUp);
            }
        });
    }, [position, powerUps, gameOver, gameStarted]); // ✅ Dependencies


    useEffect(() => {
        if (!isImmune) return;

        const timer = setTimeout(() => {
            setIsImmune(false);
            setPowerUpActive(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isImmune]);

    useEffect(() => {
        if (experience >= experienceNeeded) {
            setLevel(prev => prev + 1);
            setExperience(0);
            showNotification(`Level Up! You're now level ${level + 1}`);
            playSound('levelUp');
        }
    }, [experience, level]);

    const playSound = (soundType) => {
        if (isMuted) return;
        // Add sound implementation here if needed
    };

    

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-900 text-white touch-none">
            {/* Start Screen */}
            {!gameStarted && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800/95 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl">
                        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            HAPPY VALENTINE BABYYY 😘
                        </h1>
                        <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
                            {staticMessage}
                        </p>
                        <div className="space-y-4">
                            <div className="bg-gray-700/50 p-4 rounded-2xl">
                                <h2 className="text-xl font-semibold mb-2 text-center">High Score: {highScore}</h2>
                                {achievements.length > 0 && (
                                    <div className="flex justify-center gap-2">
                                        {achievements.map((achievement, index) => (
                                            <Trophy key={index} className="w-6 h-6 text-yellow-400 animate-pulse" />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setGameStarted(true)}
                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Play className="w-6 h-6" />
                                Start Game
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="w-full px-6 py-4 bg-gray-700/50 rounded-2xl text-lg font-semibold hover:bg-gray-600/50 active:bg-gray-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <Settings className="w-6 h-6" />
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Header - Simplified for mobile */}
            <div className="flex items-center justify-between p-3 bg-gray-800/95 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                        <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                        <span className="text-xl font-bold">{score}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        {[...Array(lives)].map((_, i) => (
                            <Heart key={i} className="w-5 h-5 text-red-500" fill="currentColor" />
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isImmune && <Shield className="w-5 h-5 text-blue-400 animate-pulse" />}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full hover:bg-gray-700/50 active:bg-gray-600/50 transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-full hover:bg-gray-700/50 active:bg-gray-600/50 transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Experience Bar - Made more visible */}
            <div className="relative h-1.5 bg-gray-700/50">
                <div
                    className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${(experience / experienceNeeded) * 100}%` }}
                />
            </div>

            {/* Game Area */}
            <div className="relative flex-1 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                    style={{ backgroundImage: `url(${selectedBackground})` }}
                >
                    {/* Player */}
                    <div
                        className={`absolute transition-all duration-75 ${isImmune ? 'animate-pulse' : ''}`}
                        style={{
                            width: `${playerSize}px`,
                            height: `${playerSize}px`,
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <img
                            src={She}
                            alt="Player"
                            className="w-full h-full rounded-full object-cover shadow-xl border-2 border-white"
                        />
                        {showPowerUpEffect && (
                            <div className="absolute inset-0 animate-ping rounded-full border-4 border-blue-500" />
                        )}
                        {showComboEffect && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-lg animate-bounce">
                                {combo}x Combo!
                            </div>
                        )}
                    </div>

                    {/* Power-ups */}
                    {powerUps.map((powerUp, index) => (
                        <div
                            key={index}
                            className="absolute w-10 h-10 md:w-12 md:h-12 animate-bounce"
                            style={{
                                left: `${powerUp.x}px`,
                                top: `${powerUp.y}px`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {powerUp.type === 'immunity' && (
                                <img
                                    src={ME}
                                    alt="Immunity"
                                    className="w-full h-full rounded-full border-2 border-blue-400 shadow-lg"
                                />
                            )}
                            {powerUp.type === 'speed' && (
                                <img
                                    src={US}
                                    alt="Speed"
                                    className="w-full h-full rounded-full border-2 border-yellow-400 shadow-lg"
                                />
                            )}
                            {powerUp.type === 'extraLife' && (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                            )}
                            {powerUp.type === 'scoreBoost' && (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg flex items-center justify-center">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Obstacles - Simplified for better mobile visibility */}
                    {obstacles.map((obstacle, index) => (
                        <div
                            key={index}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                            style={{
                                left: `${obstacle.x}px`,
                                top: `${obstacle.y}px`
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <div className={`p-2 rounded-full shadow-lg ${obstacle.color} bg-gray-800/90 backdrop-blur-sm`}>
                                    <obstacle.icon className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <span className="mt-1 px-2 py-0.5 text-xs md:text-sm bg-gray-800/90 rounded-full backdrop-blur-sm whitespace-nowrap">
                                    {obstacle.name}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Game Over Screen */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                            <div className="bg-gray-800/95 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">Game Over!</h2>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-700/50 p-3 rounded-2xl">
                                        <p className="text-sm text-gray-400">Score</p>
                                        <p className="text-xl font-bold">{score}</p>
                                    </div>
                                    <div className="bg-gray-700/50 p-3 rounded-2xl">
                                        <p className="text-sm text-gray-400">High Score</p>
                                        <p className="text-xl font-bold">{highScore}</p>
                                    </div>
                                    <div className="bg-gray-700/50 p-3 rounded-2xl">
                                        <p className="text-sm text-gray-400">Level</p>
                                        <p className="text-xl font-bold">{level}</p>
                                    </div>
                                    <div className="bg-gray-700/50 p-3 rounded-2xl">
                                        <p className="text-sm text-gray-400">Max Combo</p>
                                        <p className="text-xl font-bold">{combo}</p>
                                    </div>
                                </div>
                                {score > highScore && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl">
                                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                        <p className="text-yellow-400 font-bold">New High Score!</p>
                                    </div>
                                )}
                                <button
                                    onClick={resetGame}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Play Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Controls - Optimized for touch */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
                {useJoystick ? (
                    <div className="relative">
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-800/80 px-4 py-2 rounded-full text-sm">
                            Drag to move
                        </div>
                        <Joystick
                            size={120}
                            baseColor="rgba(17, 24, 39, 0.9)"
                            stickColor="rgba(59, 130, 246, 0.9)"
                            move={(e) => {
                                if (!e || !e.direction) return;
                                const joystickSpeedFactor = 0.25;
                                switch (e.direction) {
                                    case "FORWARD": move("up", joystickSpeedFactor); break;
                                    case "BACKWARD": move("down", joystickSpeedFactor); break;
                                    case "LEFT": move("left", joystickSpeedFactor); break;
                                    case "RIGHT": move("right", joystickSpeedFactor); break;
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 bg-gray-800/90 p-3 rounded-2xl backdrop-blur-sm">
                        <div />
                        <button
                            onClick={() => move('up')}
                            className="p-4 bg-gray-700/80 rounded-xl active:bg-gray-600/80 transition-colors touch-manipulation"
                            disabled={gameOver}
                        >
                            <ArrowUp className="w-6 h-6" />
                        </button>
                        <div />
                        <button
                            onClick={() => move('left')}
                            className="p-4 bg-gray-700/80 rounded-xl active:bg-gray-600/80 transition-colors touch-manipulation"
                            disabled={gameOver}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => move('down')}
                            className="p-4 bg-gray-700/80 rounded-xl active:bg-gray-600/80 transition-colors touch-manipulation"
                            disabled={gameOver}
                        >
                            <ArrowDown className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => move('right')}
                            className="p-4 bg-gray-700/80 rounded-xl active:bg-gray-600/80 transition-colors touch-manipulation"
                            disabled={gameOver}
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>

            {/* Settings Modal - Optimized for mobile */}
            {showSettings && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800/95 p-6 rounded-3xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">Game Settings</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">Control Type</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setUseJoystick(true)}
                                        className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${useJoystick ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' : 'bg-gray-700/50'}`}
                                    >
                                        <Gamepad2 className="w-5 h-5" />
                                        <span>Joystick</span>
                                    </button>
                                    <button
                                        onClick={() => setUseJoystick(false)}
                                        className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${!useJoystick ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' : 'bg-gray-700/50'}`}
                                    >
                                        <KeyRound className="w-5 h-5" />
                                        <span>Arrows</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">Difficulty</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['easy', 'normal', 'hard'].map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => setDifficulty(diff)}
                                            className={`p-3 rounded-xl capitalize transition-all ${difficulty === diff
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                                                    : 'bg-gray-700/50'
                                                }`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">Background</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {backgrounds.map((bg, index) => (
                                        <button
                                            key={index}
                                            className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${selectedBackground === bg.image
                                                    ? 'border-blue-500 scale-105 shadow-lg'
                                                    : 'border-transparent'
                                                }`}
                                            onClick={() => setSelectedBackground(bg.image)}
                                        >
                                            <img
                                                src={bg.image}
                                                alt={bg.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-xs font-medium">{bg.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">Sound</label>
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`w-full p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${isMuted
                                            ? 'bg-gray-700/50'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                                        }`}
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    <span>{isMuted ? 'Unmute' : 'Mute'} Sound</span>
                                </button>
                            </div>

                            <div className="pt-6 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 px-6 py-4 bg-gray-700/50 rounded-xl font-medium hover:bg-gray-600/50 active:bg-gray-500/50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSettings(false);
                                        resetGame();
                                    }}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 transition-all shadow-lg"
                                >
                                    Save & Restart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Tips Overlay - For new players */}
            {gameStarted && !showSettings && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm pointer-events-none animate-fade-out">
                    {useJoystick ? "Use the joystick to move" : "Use arrow buttons to move"}
                </div>
            )}

            {/* Achievement Notification */}
            {/* <AchievementNotification achievements={achievements} setAchievements={setAchievements} /> */}
        </div>
    );
};

export default MovementGame;