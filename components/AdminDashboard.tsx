import React, { useState } from 'react';
import { Button } from './Button';

interface AdCampaign {
  id: string;
  title: string;
  views: number;
  clicks: number;
  status: 'active' | 'ended' | 'pending';
  budget: string;
}

export const AdminDashboard: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    { id: '1', title: 'Summer Sale Short', views: 45000, clicks: 1200, status: 'active', budget: '$500' },
    { id: '2', title: 'New Collection Teaser', views: 12000, clicks: 340, status: 'active', budget: '$200' },
    { id: '3', title: 'Flash Deal Friday', views: 89000, clicks: 4500, status: 'ended', budget: '$1000' },
  ]);

  const [newCampaign, setNewCampaign] = useState({
      title: '',
      budget: '',
      type: 'video',
      targetAudience: 'Everyone'
  });

  const handleCreateCampaign = () => {
      if (!newCampaign.title || !newCampaign.budget) return;
      
      const newAd: AdCampaign = {
          id: (campaigns.length + 1).toString(),
          title: newCampaign.title,
          views: 0,
          clicks: 0,
          status: 'pending',
          budget: `$${newCampaign.budget}`
      };
      
      setCampaigns([newAd, ...campaigns]);
      setShowCreateModal(false);
      setNewCampaign({ title: '', budget: '', type: 'video', targetAudience: 'Everyone' });
      alert("Campaign Created Successfully! It is now pending review.");
  };

  const stats = [
    { label: 'Total Reach', value: '146K', trend: '+15%', color: 'bg-blue-100 text-blue-600' },
    { label: 'Link Clicks', value: '6,040', trend: '+22%', color: 'bg-green-100 text-green-600' },
    { label: 'Engagement Rate', value: '4.8%', trend: '+1.2%', color: 'bg-purple-100 text-purple-600' },
    { label: 'Ad Spend', value: '$1.7K', trend: 'On Track', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col pb-20 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 dark:text-white">Business Portal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your ads & flash deals</p>
          </div>
          <div className="flex items-center space-x-2">
             <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Live</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-5xl mx-auto w-full">
        
        {/* Stats Grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mt-1">{stat.label}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2 font-bold">{stat.trend}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Campaigns */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Promotions</h2>
            <Button onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-sm">Create New Ad</Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Campaign</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Views</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Clicks</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Budget</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {campaigns.map((camp) => (
                            <tr key={camp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-gray-900 dark:text-white">{camp.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{camp.id}</p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${camp.status === 'active' ? 'bg-green-100 text-green-700' : camp.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {camp.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{camp.views.toLocaleString()}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{camp.clicks.toLocaleString()}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{camp.budget}</td>
                                <td className="p-4">
                                    <button className="text-brand-600 hover:text-brand-800 dark:text-brand-400 text-sm font-medium">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          </div>
        </section>

        {/* Resources */}
        <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-2">Boost Your Reach</h3>
                <p className="text-white/80 mb-4 text-sm">Create a Flash Deal Short to instantly promote your products to thousands of users nearby.</p>
                <button onClick={() => setShowCreateModal(true)} className="bg-white text-brand-600 px-4 py-2 rounded-full font-bold text-sm shadow hover:bg-gray-100 transition-colors">Start Flash Deal</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Account Health</h3>
                <div className="flex items-center space-x-2 mb-4">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-[95%] h-full bg-green-500"></div>
                    </div>
                    <span className="text-xs font-bold text-green-600">95%</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your business account is in good standing. Keep engaging with your audience to maintain high visibility.</p>
            </div>
        </section>

      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-click">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">Create New Campaign</h3>
                  
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Campaign Name</label>
                          <input 
                              value={newCampaign.title}
                              onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
                              placeholder="e.g., Summer Collection Launch"
                              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Budget</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                  <input 
                                    type="number"
                                    value={newCampaign.budget}
                                    onChange={e => setNewCampaign({...newCampaign, budget: e.target.value})}
                                    placeholder="500"
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg pl-6 pr-2.5 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Type</label>
                              <select 
                                value={newCampaign.type}
                                onChange={e => setNewCampaign({...newCampaign, type: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                              >
                                  <option value="video">Standard Video</option>
                                  <option value="short">Short (Vertical)</option>
                                  <option value="banner">Banner Image</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Target Audience</label>
                          <select 
                            value={newCampaign.targetAudience}
                            onChange={e => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm outline-none focus:border-brand-500 dark:text-white"
                          >
                              <option value="everyone">Everyone</option>
                              <option value="youth">Youth (18-24)</option>
                              <option value="professionals">Professionals (25-45)</option>
                              <option value="tech">Tech Enthusiasts</option>
                          </select>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-200">
                          Your campaign will be reviewed within 24 hours. Once approved, it will start running immediately based on your budget settings.
                      </div>
                  </div>

                  <div className="flex space-x-3">
                      <button 
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-bold transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleCreateCampaign}
                        className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-md transition-colors"
                      >
                          Launch Campaign
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};