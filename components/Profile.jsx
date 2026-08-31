const Profile = ({ profile, setProfile }) => {
    return (
        <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Icon name="user" className="text-emerald-500" />
                Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Height</label>
                    <input 
                        type="text" 
                        value={profile.height} 
                        onChange={e => setProfile({...profile, height: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. 180cm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Weight</label>
                    <input 
                        type="text" 
                        value={profile.weight} 
                        onChange={e => setProfile({...profile, weight: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. 75kg"
                    />
                </div>
            </div>
        </Card>
    );
};
