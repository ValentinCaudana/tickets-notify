import React, { useState, useEffect } from "react";
import { preferencesAPI, teamsAPI, tournamentsAPI } from "../../utils/api";
import Navbar from "../Layout/Navbar";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { Save, Star } from "lucide-react";

const UserPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefsRes, teamsRes, tournamentsRes] = await Promise.all([
          preferencesAPI.get(),
          teamsAPI.getAll(),
          tournamentsAPI.getAll(),
        ]);

        setPreferences(prefsRes.data);
        setTeams(teamsRes.data);
        setTournaments(tournamentsRes.data);
        setSelectedTeams(prefsRes.data.followed_team_ids || []);
        setSelectedTournaments(prefsRes.data.followed_tournament_ids || []);
        setNotifySMS(prefsRes.data.notify_sms || false);
        setNotifyInApp(prefsRes.data.notify_in_app || true);
      } catch (error) {
        console.error("Error fetching preferences:", error);
        toast.error("Error al cargar preferencias");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTeam = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const toggleTournament = (tournamentId) => {
    setSelectedTournaments((prev) =>
      prev.includes(tournamentId)
        ? prev.filter((id) => id !== tournamentId)
        : [...prev, tournamentId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await preferencesAPI.update({
        followed_team_ids: selectedTeams,
        followed_tournament_ids: selectedTournaments,
        notify_sms: notifySMS,
        notify_in_app: notifyInApp,
      });
      toast.success("¡Preferencias guardadas exitosamente!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Error al guardar preferencias");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin text-6xl">⚽</div>
          </div>
        </div>
      </div>
    );
  }

  // Group teams by country
  const teamsByCountry = teams.reduce((acc, team) => {
    if (!acc[team.country]) acc[team.country] = [];
    acc[team.country].push(team);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Preferencias
          </h1>
          <p className="text-gray-600">
            Personaliza tus notificaciones y equipos favoritos
          </p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Notificaciones
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="notify-in-app"
                checked={notifyInApp}
                onCheckedChange={setNotifyInApp}
              />
              <label
                htmlFor="notify-in-app"
                className="text-sm font-medium cursor-pointer"
              >
                Notificaciones en la aplicación
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="notify-sms"
                checked={notifySMS}
                onCheckedChange={setNotifySMS}
              />
              <label
                htmlFor="notify-sms"
                className="text-sm font-medium cursor-pointer"
              >
                Notificaciones por SMS
              </label>
            </div>

            {notifySMS && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 ml-6">
                <p className="text-sm text-blue-800">
                  📱 Para recibir SMS, asegúrate de verificar tu número de
                  teléfono en tu perfil.
                  <br />
                  <span className="text-xs text-blue-600 italic">
                    Nota: La funcionalidad de SMS estará disponible próximamente
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Teams Selection */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Equipos Favoritos
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Selecciona los equipos que quieres seguir. Recibirás notificaciones
            cuando salgan entradas para sus partidos.
          </p>

          <div className="space-y-6">
            {Object.entries(teamsByCountry).map(([country, countryTeams]) => (
              <div key={country}>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  {country}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {countryTeams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTeams.includes(team.id)
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      data-testid={`team-${team.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedTeams.includes(team.id)}
                          onCheckedChange={() => toggleTeam(team.id)}
                        />
                        {team.logo_url && (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="w-10 h-10 object-contain"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {team.name}
                          </p>
                          {team.membership_required && (
                            <span className="text-xs text-orange-600">
                              ⭐ Requiere membresía
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournaments Selection */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-gray-900">Torneos</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Selecciona los torneos que te interesan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                onClick={() => toggleTournament(tournament.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTournaments.includes(tournament.id)
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                data-testid={`tournament-${tournament.id}`}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedTournaments.includes(tournament.id)}
                    onCheckedChange={() => toggleTournament(tournament.id)}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tournament.name}
                    </p>
                    <p className="text-sm text-gray-600">{tournament.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-6 text-lg"
            data-testid="save-preferences-btn"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Guardando..." : "Guardar Preferencias"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
