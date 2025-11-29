import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Pencil } from 'lucide-react';
import { isValidMenuId } from '../utils/menuId';

/**
 * Space Join/Create Modal Component
 * Allows users to create a new space or join an existing one
 */
export const MenuJoinModal = ({
  isOpen,
  onClose,
  onCreateSpace,
  onJoinSpace,
  onUpdateSpaceName,
  currentSpaceId,
  currentSpaceName
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isEditingSpaceName, setIsEditingSpaceName] = useState(false);
  const [editingSpaceName, setEditingSpaceName] = useState('');

  // Reset edit state when modal closes or space changes
  useEffect(() => {
    if (!isOpen) {
      setIsEditingSpaceName(false);
      setEditingSpaceName('');
    }
  }, [isOpen, currentSpaceId]);

  if (!isOpen) return null;

  const getShareableLink = () => {
    if (!currentSpaceId) return '';
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?space=${currentSpaceId}`;
  };

  const handleCopySpaceId = () => {
    if (currentSpaceId) {
      navigator.clipboard.writeText(currentSpaceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const link = getShareableLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCreate = () => {
    onCreateSpace(newSpaceName.trim() || 'MY-SPACE');
    setNewSpaceName('');
  };

  const handleJoin = () => {
    let code = joinCode.trim().toLowerCase();
    
    // If it's a URL, extract the space ID from the query parameter
    try {
      const url = new URL(code);
      const spaceParam = url.searchParams.get('space');
      if (spaceParam) {
        code = spaceParam.toLowerCase();
      }
    } catch (e) {
      // Not a URL, treat as space code
    }
    
    // Clean the code (remove any non-alphanumeric characters)
    code = code.replace(/[^a-z0-9]/g, '');
    
    if (isValidMenuId(code)) {
      onJoinSpace(code);
      setJoinCode('');
    } else {
      alert('Invalid space code. Please enter a 6-character code (e.g., abc123) or paste a shareable link.');
    }
  };

  const handleStartEditSpaceName = () => {
    setEditingSpaceName(currentSpaceName || '');
    setIsEditingSpaceName(true);
  };

  const handleSaveSpaceName = () => {
    if (onUpdateSpaceName && editingSpaceName.trim()) {
      onUpdateSpaceName(editingSpaceName.trim());
    }
    setIsEditingSpaceName(false);
    setEditingSpaceName('');
  };

  const handleCancelEditSpaceName = () => {
    setIsEditingSpaceName(false);
    setEditingSpaceName('');
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-md w-full mx-auto px-4 py-12 pb-32">
        <div className="flex justify-end mb-8">
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 transition-colors p-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="text-center mb-12 border-b border-stone-200 pb-8">
          <h3 className="text-2xl font-light text-stone-900 tracking-wide uppercase mb-2">
            {currentSpaceId ? 'Your Space' : 'Create or Join Space'}
          </h3>
          {currentSpaceId && (
            <div className="mt-4">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">
                SPACE NAME
              </p>
              {isEditingSpaceName ? (
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={editingSpaceName}
                    onChange={(e) => setEditingSpaceName(e.target.value.slice(0, 32))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveSpaceName();
                      } else if (e.key === 'Escape') {
                        handleCancelEditSpaceName();
                      }
                    }}
                    className="flex-1 text-sm text-stone-900 tracking-wide border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveSpaceName}
                    className="text-stone-600 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditSpaceName}
                    className="text-stone-400 hover:text-stone-900 transition-colors p-1"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <p className="text-sm text-stone-900 tracking-wide">
                    {currentSpaceName || 'Unnamed Space'}
                  </p>
                  {onUpdateSpaceName && (
                    <button
                      onClick={handleStartEditSpaceName}
                      className="text-stone-400 hover:text-stone-900 transition-colors p-1"
                      title="Edit space name"
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">SPACE CODE</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-2xl font-mono font-light text-stone-900 tracking-wider bg-stone-50 px-4 py-2 border border-stone-200">
                  {currentSpaceId}
                </code>
                <button
                  onClick={handleCopySpaceId}
                  className="text-stone-400 hover:text-stone-900 transition-colors p-2"
                  title="Copy space code"
                >
                  {copied ? (
                    <Check size={18} className="text-stone-900" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-3 mb-4">
                Share this code with others to collaborate
              </p>
              
              {/* Shareable Link */}
              <div className="mt-6 pt-6 border-t border-stone-200">
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">SHAREABLE LINK</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-xs font-mono text-stone-600 tracking-wide bg-stone-50 px-3 py-2 border border-stone-200 break-all flex-1 text-center">
                    {getShareableLink()}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className="text-stone-400 hover:text-stone-900 transition-colors p-2 flex-shrink-0"
                    title="Copy shareable link"
                  >
                    {linkCopied ? (
                      <Check size={18} className="text-stone-900" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-3">
                  Share this link to let others join your space
                </p>
              </div>
            </div>
          )}
        </div>

        {!currentSpaceId && (
          <>
            {/* Create New Space */}
            <div className="mb-12">
              <h4 className="text-sm font-light text-stone-900 uppercase tracking-widest mb-4">
                Create New Space
              </h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="e.g. FAMILY-DINNER"
                  value={newSpaceName}
                  onChange={(e) => {
                    // Let the user type freely; we'll normalize the name when creating the space
                    setNewSpaceName(e.target.value.slice(0, 32));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate();
                    }
                  }}
                  className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent text-sm"
                />
                <button
                  onClick={handleCreate}
                  className="w-full text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-2"
                >
                  Create Space
                </button>
              </div>
            </div>

            {/* Join Existing Space */}
            <div className="border-t border-stone-200 pt-8">
              <h4 className="text-sm font-light text-stone-900 uppercase tracking-widest mb-4">
                Join Existing Space
              </h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter space code or paste link"
                  value={joinCode}
                  onChange={(e) => {
                    let value = e.target.value;
                    // If it's a URL, extract the space ID from the query parameter
                    try {
                      const url = new URL(value);
                      const spaceParam = url.searchParams.get('space');
                      if (spaceParam) {
                        value = spaceParam;
                      }
                    } catch (e) {
                      // Not a URL, treat as space code
                    }
                    setJoinCode(value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleJoin();
                    }
                  }}
                  className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent text-sm font-mono tracking-wider text-center"
                  maxLength={200}
                />
                <button
                  onClick={handleJoin}
                  disabled={!isValidMenuId(joinCode)}
                  className="w-full text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Join Space
                </button>
              </div>
            </div>
          </>
        )}

        {currentSpaceId && (
          <div className="text-center">
            <button
              onClick={() => {
                if (window.confirm('Leave this space? You can rejoin later with the space code.')) {
                  onJoinSpace(null); // Clear current space
                }
              }}
              className="text-stone-400 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
            >
              Leave Space
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


