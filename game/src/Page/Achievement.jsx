import React, { useEffect, useState } from "react";

const AchievementNotification = ({ achievements, setAchievements }) => {
    useEffect(() => {
        if (achievements.length > 0) {
            const timer = setTimeout(() => {
                setAchievements((prev) => prev.slice(1)); // Remove the first achievement after 1 second
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [achievements, setAchievements]);

    return (
        <div className="fixed top-4 right-4 pointer-events-none z-50">
            {achievements.map((achievement, index) => (
                <div
                    key={index}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 animate-slide-in"
                >
                    🏆 Achievement Unlocked: {achievement}
                </div>
            ))}
        </div>
    );
};

export default AchievementNotification;
