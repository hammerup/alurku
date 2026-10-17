import { useState, useCallback } from 'react';
import axios from 'axios';

export function useTeamManagement({
  isAuthenticated,
  currentUser,
  selectedBoard,
  setSelectedBoard,
  activeWorkspace,
  setBoards,
  fetchBoards,
  fetchTasks,
  showNotification,
  setIsLoading,
  isSuperAdmin,
  setIsSuperAdmin,
  setAccountStatus,
  setIsTeamModalOpen,
  setIsSettingsOpen,
  setIsMobileMenuOpen,
  handleLogout,
}) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [myTeam, setMyTeam] = useState([]);
  const [userDirectory, setUserDirectory] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [avatarsMap, setAvatarsMap] = useState({});
  const [adminUsers, setAdminUsers] = useState([]);
  const [profileData, setProfileData] = useState({ username: '', email: '', full_name: '' });
  const [memberToRevoke, setMemberToRevoke] = useState(null);
  const [transferTargetUsername, setTransferTargetUsername] = useState(null);

  const [inviteInput, setInviteInput] = useState('');
  const [inviteSuggestions, setInviteSuggestions] = useState([]);
  const [inviteIndex, setInviteIndex] = useState(0);

  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  const fetchInvitations = useCallback(() => {
    if (!isAuthenticated) return;
    axios
      .get('/api/invitations')
      .then((res) => setInvitations(res.data.invitations || []))
      .catch((err) => console.error(err));
  }, [isAuthenticated]);

  const fetchTeamMembers = useCallback(() => {
    if (!isAuthenticated) return;

    if (!selectedBoard || selectedBoard.id === 'global') {
      if (activeWorkspace?.id) {
        axios
          .get(`/api/workspaces/${activeWorkspace.id}/members`)
          .then((res) => {
            const memberUsernames = (res.data || []).map((m) => m.username);
            setTeamMembers(memberUsernames.length > 0 ? memberUsernames : [currentUser]);
          })
          .catch(() => setTeamMembers([currentUser]));
      } else {
        setTeamMembers([currentUser]);
      }
      return;
    }

    axios
      .get(`/api/boards/${selectedBoard.id}/members`)
      .then((res) => setTeamMembers(res.data.members || []))
      .catch((err) => {
        if (err.response?.status === 403 && setSelectedBoard) setSelectedBoard(null);
        console.error(err);
      });
  }, [isAuthenticated, selectedBoard, activeWorkspace?.id, currentUser, setSelectedBoard]);

  const fetchAvatars = useCallback(() => {
    if (!isAuthenticated) return;
    axios
      .get('/api/users/avatars')
      .then((res) => {
        setAvatarsMap(res.data.avatars || {});
        if (res.data.directory) setUserDirectory(res.data.directory);
      })
      .catch(console.error);
  }, [isAuthenticated]);

  const fetchMyTeam = useCallback(
    (bId = null) => {
      if (!isAuthenticated) return;
      const targetId = bId || (selectedBoard ? selectedBoard.id : null);
      if (!targetId || targetId === 'global') return;
      axios
        .get(`/api/boards/${targetId}/manage`)
        .then((res) => setMyTeam(res.data.team || []))
        .catch(console.error);
    },
    [isAuthenticated, selectedBoard]
  );

  const fetchProfileStatus = useCallback(() => {
    if (!isAuthenticated) return;
    axios
      .get('/api/profile')
      .then((res) => {
        if (setAccountStatus) setAccountStatus(res.data.account_status || 'active');
        if (setIsSuperAdmin) setIsSuperAdmin(res.data.is_superadmin === 1);
        setProfileData({ ...res.data, current_password: '', new_password: '' });
      })
      .catch(console.error);
  }, [isAuthenticated, setAccountStatus, setIsSuperAdmin]);

  const openTeamModal = (bId = null) => {
    fetchMyTeam(bId);
    if (setIsTeamModalOpen) setIsTeamModalOpen(true);
  };

  const handleInviteTeam = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inviteInput.trim()) return;
    if (setIsLoading) setIsLoading(true);

    axios
      .post(`/api/boards/${selectedBoard.id}/invite`, { members_input: inviteInput.trim() })
      .then((res) => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) showNotification(res.data.message, 'success');
        setInviteInput('');
        setInviteSuggestions([]);
        fetchMyTeam();
      })
      .catch((err) => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to invite user.', 'error');
        }
      });
  };

  const handleInviteInputChange = (e) => {
    const val = e.target.value;
    setInviteInput(val);

    const parts = val.split(',');
    const currentPart = parts[parts.length - 1].trim();

    if (currentPart.length >= 1) {
      const query = currentPart.toLowerCase();
      const suggestions = userDirectory
        .filter((u) => {
          const isExactMatch =
            u.username.toLowerCase() === query ||
            (u.email &&
              u.email !== 'Hidden for privacy' &&
              u.email !== 'Email hidden for privacy' &&
              u.email.toLowerCase() === query);

          if (u.is_connected || isSuperAdmin) {
            return (
              u.username.toLowerCase().includes(query) ||
              (u.email &&
                u.email !== 'Hidden for privacy' &&
                u.email !== 'Email hidden for privacy' &&
                u.email.toLowerCase().includes(query))
            );
          } else {
            return isExactMatch;
          }
        })
        .filter(
          (u) => u.username !== currentUser && u.username !== 'admin' && !myTeam.some((m) => m.username === u.username)
        );
      setInviteSuggestions(suggestions);
      setInviteIndex(0);
    } else {
      setInviteSuggestions([]);
    }
  };

  const applyInviteSuggestion = (username) => {
    const parts = inviteInput.split(',');
    parts[parts.length - 1] = ` ${username}`;
    setInviteInput(parts.join(',').trim() + ', ');
    setInviteSuggestions([]);
  };

  const handleRevokeMember = (id) => {
    setMemberToRevoke(id);
  };

  const confirmRevokeMember = () => {
    if (!memberToRevoke) return;
    axios
      .delete(`/api/boards/${selectedBoard.id}/revoke/${memberToRevoke}`)
      .then(() => {
        if (showNotification) showNotification('Access revoked successfully', 'success');

        const revokedMember = myTeam.find((m) => m.id === memberToRevoke);
        if (revokedMember && revokedMember.username === currentUser) {
          if (setIsTeamModalOpen) setIsTeamModalOpen(false);
          if (setSelectedBoard) setSelectedBoard(null);
          if (fetchBoards) fetchBoards();
        } else {
          fetchMyTeam();
          fetchTeamMembers();
          if (revokedMember && revokedMember.status === 'requesting') {
            if (setSelectedBoard) {
              setSelectedBoard((prev) =>
                prev ? { ...prev, access_requests_count: Math.max(0, (prev.access_requests_count || 1) - 1) } : prev
              );
            }
            if (setBoards) {
              setBoards((prev) =>
                prev.map((b) =>
                  b.id === selectedBoard.id
                    ? { ...b, access_requests_count: Math.max(0, (b.access_requests_count || 1) - 1) }
                    : b
                )
              );
            }
            if (fetchBoards) fetchBoards();
          }
        }

        setMemberToRevoke(null);
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to revoke access', 'error');
      });
  };

  const handleAcceptAccessRequest = (memberId) => {
    axios
      .put(`/api/boards/${selectedBoard.id}/requests/${memberId}/accept`)
      .then((res) => {
        if (showNotification) showNotification(res.data.message, 'success');
        fetchMyTeam();
        fetchTeamMembers();
        if (setSelectedBoard) {
          setSelectedBoard((prev) =>
            prev ? { ...prev, access_requests_count: Math.max(0, (prev.access_requests_count || 1) - 1) } : prev
          );
        }
        if (setBoards) {
          setBoards((prev) =>
            prev.map((b) =>
              b.id === selectedBoard.id
                ? { ...b, access_requests_count: Math.max(0, (b.access_requests_count || 1) - 1) }
                : b
            )
          );
        }
        if (fetchBoards) fetchBoards();
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to accept request', 'error');
        }
      });
  };

  const handleAcceptInvite = (id) => {
    axios
      .put(`/api/invitations/${id}/accept`)
      .then(() => {
        if (showNotification) showNotification('Invitation accepted!', 'success');
        fetchInvitations();
        if (fetchBoards) fetchBoards();
        if (fetchTasks) fetchTasks();
        fetchTeamMembers();
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to accept invitation.', 'error');
      });
  };

  const handleDeclineInvite = (id) => {
    axios
      .delete(`/api/invitations/${id}/decline`)
      .then(() => {
        if (showNotification) showNotification('Invitation declined.', 'success');
        fetchInvitations();
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to decline invitation.', 'error');
      });
  };

  const handleTransferToMember = (newOwnerUsername) => {
    setTransferTargetUsername(newOwnerUsername);
  };

  const confirmTransferOwnership = () => {
    if (!transferTargetUsername) return;
    if (setIsLoading) setIsLoading(true);
    axios
      .put(`/api/boards/${selectedBoard.id}/transfer-member`, { new_owner: transferTargetUsername })
      .then((res) => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) showNotification(res.data.message, 'success');
        if (setIsTeamModalOpen) setIsTeamModalOpen(false);
        setTransferTargetUsername(null);
        if (setSelectedBoard) setSelectedBoard(null);
        if (fetchBoards) fetchBoards();
      })
      .catch((err) => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to transfer', 'error');
        setTransferTargetUsername(null);
      });
  };

  const openSettings = () => {
    setProfileData((prev) => ({ ...prev, current_password: '', new_password: '' }));
    if (setIsSettingsOpen) setIsSettingsOpen(true);
  };

  const handleUpdateProfile = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (profileData.new_password && !profileData.current_password) {
      if (showNotification) showNotification('Please enter your current password to change it.', 'error');
      return;
    }
    if (setIsLoading) setIsLoading(true);
    const payload = {
      full_name: profileData.full_name,
      email: profileData.email,
      avatar: profileData.avatar,
      current_password: profileData.current_password,
      new_password: profileData.new_password,
    };
    axios
      .put('/api/profile', payload)
      .then((res) => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) showNotification(res.data.message || 'Profile updated successfully!', 'success');
        fetchAvatars();

        if (res.data.email_changed) {
          setTimeout(() => {
            if (handleLogout) handleLogout();
            if (showNotification) showNotification('Session expired. Please verify your new email to login.', 'info');
          }, 2500);
        }
      })
      .catch((err) => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update profile', 'error');
      });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        if (showNotification) showNotification('Image size must be less than 1MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAdminModal = () => {
    if (setSelectedBoard) setSelectedBoard(null);
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    window.history.pushState({}, '', '/admin');
    window.dispatchEvent(new CustomEvent('alurku-navigate'));
    axios
      .get('/api/admin/users')
      .then((res) => {
        setAdminUsers(res.data.users || []);
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to load users or unauthorized', 'error');
      });
  };

  const handleToggleSuperAdmin = (username) => {
    axios
      .put(`/api/admin/users/superadmin`, { username, status: '' })
      .then((res) => {
        if (showNotification) showNotification(res.data.message, 'success');
        openAdminModal();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update role', 'error');
      });
  };

  const handleManualVerify = (username) => {
    axios
      .put(`/api/admin/users/verify`, { username, status: '' })
      .then((res) => {
        if (showNotification) showNotification(res.data.message, 'success');
        openAdminModal();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to verify user', 'error');
      });
  };

  const handleUpdateUserStatus = (username, status, offboardDate = null) => {
    axios
      .put(`/api/admin/users/status`, { username, status, offboard_date: offboardDate })
      .then((res) => {
        if (showNotification) showNotification(res.data.message, 'success');
        openAdminModal();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update status', 'error');
      });
  };

  const handleDeleteUser = (username) => {
    axios
      .post(`/api/admin/users/delete`, { username, status: '' })
      .then(() => {
        if (showNotification) showNotification(`User @${username} deleted`, 'success');
        openAdminModal();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to delete user', 'error');
      });
  };

  return {
    teamMembers,
    setTeamMembers,
    myTeam,
    setMyTeam,
    userDirectory,
    setUserDirectory,
    invitations,
    setInvitations,
    avatarsMap,
    setAvatarsMap,
    adminUsers,
    setAdminUsers,
    profileData,
    setProfileData,
    memberToRevoke,
    setMemberToRevoke,
    transferTargetUsername,
    setTransferTargetUsername,
    inviteInput,
    setInviteInput,
    inviteSuggestions,
    setInviteSuggestions,
    inviteIndex,
    setInviteIndex,
    isMentioning,
    setIsMentioning,
    mentionQuery,
    setMentionQuery,
    mentionIndex,
    setMentionIndex,
    fetchInvitations,
    fetchTeamMembers,
    fetchAvatars,
    fetchMyTeam,
    fetchProfileStatus,
    openTeamModal,
    handleInviteTeam,
    handleInviteInputChange,
    applyInviteSuggestion,
    handleRevokeMember,
    confirmRevokeMember,
    handleAcceptAccessRequest,
    handleAcceptInvite,
    handleDeclineInvite,
    handleTransferToMember,
    confirmTransferOwnership,
    openSettings,
    handleUpdateProfile,
    handleAvatarUpload,
    openAdminModal,
    handleToggleSuperAdmin,
    handleManualVerify,
    handleUpdateUserStatus,
    handleDeleteUser,
  };
}
