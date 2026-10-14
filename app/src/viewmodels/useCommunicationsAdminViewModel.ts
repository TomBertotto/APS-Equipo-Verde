import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { SentCommunication } from '../models/CommunicationsService';
import { Team } from '../models/ProfilesService';

export function useCommunicationsAdminViewModel() {
  const { communicationsService, profilesService } = useContainer();
  const [teams, setTeams] = useState<Team[]>([]);
  const [sent, setSent] = useState<SentCommunication[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [teamIds, setTeamIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const [teamList, sentList] = await Promise.all([profilesService.getTeams(), communicationsService.getSent()]);
      setTeams(teamList);
      setSent(sentList);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleTeam(id: number) {
    setTeamIds((current) => (current.includes(id) ? current.filter((t) => t !== id) : [...current, id]));
  }

  async function send() {
    setSending(true);
    setError('');
    setMessage('');
    try {
      await communicationsService.send(subject, body, teamIds);
      setSubject('');
      setBody('');
      setTeamIds([]);
      setMessage('Comunicación enviada');
      setSent(await communicationsService.getSent());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return {
    teams,
    sent,
    subject,
    setSubject,
    body,
    setBody,
    teamIds,
    toggleTeam,
    loading,
    sending,
    error,
    message,
    send,
  };
}
