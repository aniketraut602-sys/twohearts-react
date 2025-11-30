import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getToken, saveUser } from '../lib/storage';

const API_URL = '/api';

export default function ProfileEdit() {
    const { user: currentUser, setUser } = useOutletContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        interests: '',
        seeking: '',
        age: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                bio: currentUser.bio || '',
                interests: currentUser.interests || '',
                seeking: currentUser.seeking || '',
                age: currentUser.age || '',
                location: currentUser.location || ''
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const token = getToken();

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();

            // Update user in storage and context
            saveUser(updatedUser);
            setUser(updatedUser);

            setSuccess('Profile updated successfully!');

            // Redirect after 1 second
            setTimeout(() => {
                navigate('/browse');
            }, 1000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card" style={{ maxWidth: '600px' }}>
                <h2 className="text-center">Edit Your Profile</h2>

                {error && (
                    <div role="alert" className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div role="status" className="alert alert-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tell us about yourself..."
                            style={{
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="interests">Interests</label>
                        <input
                            id="interests"
                            name="interests"
                            type="text"
                            value={formData.interests}
                            onChange={handleChange}
                            placeholder="e.g., Reading, Hiking, Music"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="seeking">Looking For</label>
                        <select
                            id="seeking"
                            name="seeking"
                            value={formData.seeking}
                            onChange={handleChange}
                            style={{
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                width: '100%'
                            }}
                        >
                            <option value="">Select...</option>
                            <option value="Friendship">Friendship</option>
                            <option value="Relationship">Relationship</option>
                            <option value="Companionship">Companionship</option>
                            <option value="Networking">Networking</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input
                            id="age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleChange}
                            min="18"
                            max="120"
                            placeholder="Your age"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, Country"
                        />
                    </div>

                    <div className="actions">
                        <button
                            type="button"
                            onClick={() => navigate('/browse')}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
