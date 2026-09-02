import { useState, useEffect } from 'react';
import axios from 'axios';

let cachedPolicies = null;
let fetchPromise = null;

const DEFAULT_POLICIES = {
  org_name: 'alurku.',
  default_language: 'id',
  allow_public_signup: true,
  allowed_domains: '',
  default_ai_engine: 'auto',
  enable_proactive_nudge: true,
  enable_auto_subtasks: true,
};

export function usePublicPolicies() {
  const [policies, setPolicies] = useState(() => cachedPolicies || DEFAULT_POLICIES);
  const [loading, setLoading] = useState(!cachedPolicies);

  useEffect(() => {
    if (cachedPolicies) return;

    if (!fetchPromise) {
      fetchPromise = axios
        .get('/api/public/policies')
        .then((res) => {
          if (res.data && typeof res.data === 'object') {
            cachedPolicies = { ...DEFAULT_POLICIES, ...res.data };
          } else {
            cachedPolicies = DEFAULT_POLICIES;
          }
          return cachedPolicies;
        })
        .catch((err) => {
          console.warn('[usePublicPolicies] Failed to fetch public policies, using defaults:', err);
          cachedPolicies = DEFAULT_POLICIES;
          return cachedPolicies;
        })
        .finally(() => {
          fetchPromise = null;
        });
    }

    fetchPromise.then((p) => {
      setPolicies(p);
      setLoading(false);
    });
  }, []);

  const allowedDomainList = (policies.allowed_domains || '')
    .split(',')
    .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);

  const isEmailDomainAllowed = (email) => {
    if (!allowedDomainList.length) return true;
    if (!email || !email.includes('@')) return true; // not fully entered yet
    const domain = email.split('@').pop().trim().toLowerCase();
    return allowedDomainList.includes(domain);
  };

  return {
    policies,
    loading,
    allowedDomainList,
    isEmailDomainAllowed,
  };
}
