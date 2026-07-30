'use client';
/**
 * SilentEye — Emergency contacts manager.
 * The people notified (by email) when this user triggers an emergency.
 */
import { useState, useEffect, useCallback } from 'react';

const INPUT = 'w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-300 text-[14px] focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all';

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  relationship: string | null;
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/me/emergency-contacts', { headers: authHeaders() });
      if (res.ok) setContacts(await res.json());
    } catch { /* non-fatal */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    setError('');
    if (name.trim().length < 2) { setError('Ingresa el nombre del contacto'); return; }
    if (!email.trim() && !phone.trim()) { setError('Agrega al menos un correo o un teléfono'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/me/emergency-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          relationship: relationship.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al agregar'); return; }
      setContacts((prev) => [...prev, data]);
      setName(''); setRelationship(''); setEmail(''); setPhone('');
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/me/emergency-contacts/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch { /* non-fatal */ }
  };

  return (
    <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-1">Contactos de emergencia</h2>
      <p className="text-[13px] text-zinc-400 mb-6">
        Si activas una emergencia, estas personas reciben un aviso por correo con tu ubicación — y otro cuando la situación se resuelve. Máximo 5.
      </p>

      <div className="space-y-2 mb-5">
        {contacts.length === 0 && (
          <p className="text-[13px] text-zinc-400">Aún no agregas contactos. Nadie de tu familia sería avisado en una emergencia.</p>
        )}
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-zinc-900 truncate">
                {c.name}
                {c.relationship && <span className="text-zinc-400 font-normal"> · {c.relationship}</span>}
              </div>
              <div className="text-[12px] text-zinc-400 truncate">
                {c.email || ''}{c.email && c.phone ? ' · ' : ''}{c.phone || ''}
              </div>
            </div>
            <button onClick={() => remove(c.id)} className="text-[13px] text-red-500 hover:text-red-700 font-medium ml-3 flex-shrink-0">Quitar</button>
          </div>
        ))}
      </div>

      {contacts.length < 5 && (
        <div className="space-y-3 border-t border-zinc-200 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className={INPUT} />
            <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Parentesco (ej. esposa)" className={INPUT} />
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo (para el aviso)" type="email" className={INPUT} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono (opcional, para SMS a futuro)" type="tel" className={INPUT} />
          {error && <p className="text-red-600 text-[13px]">{error}</p>}
          <button
            onClick={add}
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-40 transition-colors bg-zinc-900 hover:bg-zinc-800"
          >
            {saving ? 'Agregando…' : '+ Agregar contacto'}
          </button>
        </div>
      )}
    </section>
  );
}
