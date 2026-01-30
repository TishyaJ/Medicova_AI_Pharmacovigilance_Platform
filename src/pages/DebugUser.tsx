import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

const DebugUser = () => {
    const { user } = useAuth();
    const [localStorageData, setLocalStorageData] = useState<any>({});

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const profileData = localStorage.getItem('profile');

        setLocalStorageData({
            user: userData ? JSON.parse(userData) : null,
            profile: profileData ? JSON.parse(profileData) : null,
        });
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Debug User Data</h1>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Auth Context User</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">LocalStorage User</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(localStorageData.user, null, 2)}
                    </pre>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">LocalStorage Profile</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(localStorageData.profile, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default DebugUser;
