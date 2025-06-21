import React, { useState, useRef } from 'react';
import { XIcon, CameraIcon, ChevronRightIcon, EyeIcon, EyeOffIcon, ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function ProfileModal({
  onClose,
  setActiveScreen
}) {
  const {
    i18n
  } = useTranslation();
  const fileInputRef = useRef(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: 'Olivia Harper',
    email: 'olivia.harper@email.com',
    notifications: true,
    language: i18n.language,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };
  const togglePasswordVisibility = field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XIcon size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                <img src="/Captura_de_tela_2025-05-23_023613.png" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-gray-700 rounded-full border-2 border-gray-800 hover:bg-gray-600">
                <CameraIcon size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <p className="text-sm text-gray-400">Click to upload new photo</p>
          </div>
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))} className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))} className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
            </div>
          </div>
          {/* Password Section */}
          <div className="space-y-4">
            {!isChangingPassword ? <button onClick={() => setIsChangingPassword(true)} className="w-full text-left px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                Change Password
              </button> : <div className="space-y-4 bg-gray-750 p-4 rounded-lg">
                <h3 className="font-medium">Change Password</h3>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input type={showPasswords.current ? 'text' : 'password'} value={formData.currentPassword} onChange={e => setFormData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))} className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10" />
                      <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                        {showPasswords.current ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </button>
                    </div>
                  </div>
                  {/* New Password */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input type={showPasswords.new ? 'text' : 'password'} value={formData.newPassword} onChange={e => setFormData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))} className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10" />
                      <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                        {showPasswords.new ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input type={showPasswords.confirm ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))} className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10" />
                      <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                        {showPasswords.confirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button onClick={() => setIsChangingPassword(false)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">
                    Cancel
                  </button>
                  <button className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 text-sm">
                    Update Password
                  </button>
                </div>
              </div>}
          </div>
          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Preferences</h3>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-400">
                  Manage your notification settings
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.notifications} onChange={() => setFormData(prev => ({
                ...prev,
                notifications: !prev.notifications
              }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            
          </div>
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">About</h3>
            <button onClick={() => {
            onClose();
            setActiveScreen('terms');
          }} className="w-full flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <span className="font-medium">Terms of Service</span>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </button>
            <button onClick={() => {
            onClose();
            setActiveScreen('privacy');
          }} className="w-full flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <span className="font-medium">Privacy Policy</span>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </button>
          </div>
          {/* Subscription */}
          <div className="space-y-4"></div>
          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Support</h3>
            <button className="w-full flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <span className="font-medium">Contact Support</span>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white">
              Cancel
            </button>
            <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>;
}