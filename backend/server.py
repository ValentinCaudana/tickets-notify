¡Perfecto! Te voy a dar una guía paso a paso de TODOS los archivos que necesitas copiar a tu VSCode. Voy a enviarte el contenido de cada archivo de forma clara:

---

## **📋 GUÍA COMPLETA - ARCHIVOS PARA COPIAR A TU VSCODE**

### **PASO 1: Backend - Actualizar dependencias**

En tu terminal (dentro del proyecto):
```bash
cd backend
pip install httpx twilio emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
pip freeze > requirements.txt
```

---

### **PASO 2: Backend - Archivo principal del servidor**

**📄 Archivo:** `backend/server.py`

Este archivo es MUY LARGO (600+ líneas). Déjame mostrarte el contenido completo:
Action: file_editor view /app/backend/server.py
Observation: /app/backend/server.py:
1|from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Cookie, Header
2|from fastapi.responses import StreamingResponse
3|from dotenv import load_dotenv
4|from starlette.middleware.cors import CORSMiddleware
5|from motor.motor_asyncio import AsyncIOMotorClient
6|import os
7|import logging
8|from pathlib import Path
9|from pydantic import BaseModel, Field, ConfigDict, EmailStr
10|from typing import List, Optional
11|import uuid
12|from datetime import datetime, timezone, timedelta
13|import httpx
14|from io import BytesIO
15|
16|ROOT_DIR = Path(__file__).parent
17|load_dotenv(ROOT_DIR / '.env')
18|
19|# MongoDB connection
20|mongo_url = os.environ['MONGO_URL']
21|client = AsyncIOMotorClient(mongo_url)
22|db = client[os.environ['DB_NAME']]
23|
24|# Create the main app without a prefix
25|app = FastAPI()
26|
27|# Create a router with the /api prefix
28|api_router = APIRouter(prefix="/api")
29|
30|# ==================== MODELS ====================
31|
32|class User(BaseModel):
33|    model_config = ConfigDict(extra="ignore")
34|    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
35|    email: EmailStr
36|    name: str
37|    picture: Optional[str] = None
38|    phone: Optional[str] = None
39|    phone_verified: bool = False
40|    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
41|
42|class UserSession(BaseModel):
43|    model_config = ConfigDict(extra="ignore")
44|    user_id: str
45|    session_token: str
46|    expires_at: datetime
47|    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
48|
49|class Team(BaseModel):
50|    model_config = ConfigDict(extra="ignore")
51|    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
52|    name: str
53|    country: str
54|    logo_url: Optional[str] = None
55|    official_website: Optional[str] = None
56|    twitter_handle: Optional[str] = None
57|    membership_required: bool = False
58|    membership_url: Optional[str] = None
59|    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
60|
61|class Tournament(BaseModel):
62|    model_config = ConfigDict(extra="ignore")
63|    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
64|    name: str  # Liga Argentina, Copa América, Mundial 2026, etc.
65|    year: int
66|    country: Optional[str] = None
67|    official_website: Optional[str] = None
68|    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
69|
70|class TicketSource(BaseModel):
71|    model_config = ConfigDict(extra="ignore")
72|    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
73|    name: str  # Ticketek, Plateanet, Sitio oficial del club, etc.
74|    website_url: str
75|    instructions: Optional[str] = None  # Pasos para comprar
76|    membership_required: bool = False
77|    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
78|
79|class Match(BaseModel):
80|    model_config = ConfigDict(extra="ignore")
81|    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
82|    home_team_id: str
83|    away_team_id: str
84|    tournament_id: str
85|    match_date: datetime
86|    venue: str
87|    ticket_sale_date: Optional[datetime] = None  # Fecha cuando salen a la venta
88|    ticket_available: bool = False
89|    ticket_source_ids: List[str] = []  # IDs de TicketSource
90|    notes: Optional[str] = None
91|    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
92|    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
93|
94|class Notification(BaseModel):
95|    model_config = ConfigDict(extra="ignore")
96|    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
97|    user_id: str
98|    match_id: str
99|    message: str
100|    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
101|    read: bool = False
102|    notification_type: str = "ticket_available"  # ticket_available, reminder, etc.
103|
104|class UserPreferences(BaseModel):
105|    model_config = ConfigDict(extra="ignore")
106|    user_id: str
107|    followed_team_ids: List[str] = []
108|    followed_tournament_ids: List[str] = []
109|    notify_sms: bool = False
110|    notify_in_app: bool = True
111|    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
112|    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
113|
114|# ==================== REQUEST/RESPONSE MODELS ====================
115|
116|class TeamCreate(BaseModel):
117|    name: str
118|    country: str
119|    logo_url: Optional[str] = None
120|    official_website: Optional[str] = None
121|    twitter_handle: Optional[str] = None
122|    membership_required: bool = False
123|    membership_url: Optional[str] = None
124|
125|class TournamentCreate(BaseModel):
126|    name: str
127|    year: int
128|    country: Optional[str] = None
129|    official_website: Optional[str] = None
130|
131|class TicketSourceCreate(BaseModel):
132|    name: str
133|    website_url: str
134|    instructions: Optional[str] = None
135|    membership_required: bool = False
136|
137|class MatchCreate(BaseModel):
138|    home_team_id: str
139|    away_team_id: str
140|    tournament_id: str
141|    match_date: datetime
142|    venue: str
143|    ticket_sale_date: Optional[datetime] = None
144|    ticket_source_ids: List[str] = []
145|    notes: Optional[str] = None
146|
147|class MatchUpdate(BaseModel):
148|    ticket_sale_date: Optional[datetime] = None
149|    ticket_available: Optional[bool] = None
150|    ticket_source_ids: Optional[List[str]] = None
151|    notes: Optional[str] = None
152|
153|class UserPreferencesUpdate(BaseModel):
154|    followed_team_ids: Optional[List[str]] = None
155|    followed_tournament_ids: Optional[List[str]] = None
156|    notify_sms: Optional[bool] = None
157|    notify_in_app: Optional[bool] = None
158|
159|class PhoneVerifyRequest(BaseModel):
160|    phone_number: str
161|
162|class PhoneVerifyCode(BaseModel):
163|    phone_number: str
164|    code: str
165|
166|# ==================== AUTH HELPERS ====================
167|
168|async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)) -> Optional[User]:
169|    """Get current user from session token in cookie or Authorization header"""
170|    token = session_token
171|    
172|    # Fallback to Authorization header if no cookie
173|    if not token and authorization:
174|        if authorization.startswith("Bearer "):
175|            token = authorization.replace("Bearer ", "")
176|    
177|    if not token:
178|        return None
179|    
180|    # Find session
181|    session = await db.user_sessions.find_one({"session_token": token})
182|    if not session:
183|        return None
184|    
185|    # Check if expired
186|    expires_at = session["expires_at"]
187|    if isinstance(expires_at, str):
188|        expires_at = datetime.fromisoformat(expires_at)
189|    
190|    if expires_at < datetime.now(timezone.utc):
191|        await db.user_sessions.delete_one({"session_token": token})
192|        return None
193|    
194|    # Find user
195|    user_doc = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
196|    if not user_doc:
197|        return None
198|    
199|    # Convert ISO strings back to datetime
200|    if isinstance(user_doc.get('created_at'), str):
201|        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
202|    
203|    return User(**user_doc)
204|
205|async def require_auth(user: Optional[User] = Depends(get_current_user)) -> User:
206|    """Require authentication"""
207|    if not user:
208|        raise HTTPException(status_code=401, detail="Not authenticated")
209|    return user
210|
211|# ==================== AUTH ROUTES ====================
212|
213|@api_router.get("/auth/me", response_model=User)
214|async def get_me(user: User = Depends(require_auth)):
215|    """Get current user info"""
216|    return user
217|
218|@api_router.post("/auth/session")
219|async def create_session(response: Response, session_id: str = Header(..., alias="X-Session-ID")):
220|    """Create session from Emergent Auth session_id"""
221|    try:
222|        # Call Emergent Auth to get user data
223|        async with httpx.AsyncClient() as client:
224|            auth_response = await client.get(
225|                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
226|                headers={"X-Session-ID": session_id}
227|            )
228|            
229|            if auth_response.status_code != 200:
230|                raise HTTPException(status_code=401, detail="Invalid session_id")
231|            
232|            user_data = auth_response.json()
233|            session_token = user_data.get("session_token")
234|            
235|            # Check if user exists
236|            existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
237|            
238|            if not existing_user:
239|                # Create new user
240|                new_user = User(
241|                    id=user_data["id"],
242|                    email=user_data["email"],
243|                    name=user_data["name"],
244|                    picture=user_data.get("picture")
245|                )
246|                user_dict = new_user.model_dump()
247|                user_dict['created_at'] = user_dict['created_at'].isoformat()
248|                await db.users.insert_one(user_dict)
249|                
250|                # Create default preferences
251|                preferences = UserPreferences(user_id=new_user.id)
252|                pref_dict = preferences.model_dump()
253|                pref_dict['created_at'] = pref_dict['created_at'].isoformat()
254|                pref_dict['updated_at'] = pref_dict['updated_at'].isoformat()
255|                await db.user_preferences.insert_one(pref_dict)
256|                
257|                user_id = new_user.id
258|            else:
259|                user_id = existing_user["id"]
260|            
261|            # Create session
262|            session = UserSession(
263|                user_id=user_id,
264|                session_token=session_token,
265|                expires_at=datetime.now(timezone.utc) + timedelta(days=7)
266|            )
267|            session_dict = session.model_dump()
268|            session_dict['expires_at'] = session_dict['expires_at'].isoformat()
269|            session_dict['created_at'] = session_dict['created_at'].isoformat()
270|            await db.user_sessions.insert_one(session_dict)
271|            
272|            # Set httpOnly cookie
273|            response.set_cookie(
274|                key="session_token",
275|                value=session_token,
276|                httponly=True,
277|                secure=True,
278|                samesite="none",
279|                max_age=7*24*60*60,  # 7 days
280|                path="/"
281|            )
282|            
283|            return {"success": True, "user_id": user_id}
284|            
285|    except Exception as e:
286|        logging.error(f"Session creation error: {e}")
287|        raise HTTPException(status_code=500, detail=str(e))
288|
289|@api_router.post("/auth/logout")
290|async def logout(response: Response, user: User = Depends(require_auth), session_token: Optional[str] = Cookie(None)):
291|    """Logout user"""
292|    if session_token:
293|        await db.user_sessions.delete_one({"session_token": session_token})
294|    
295|    response.delete_cookie(key="session_token", path="/")
296|    return {"success": True}
297|
298|# ==================== PHONE VERIFICATION ROUTES ====================
299|
300|@api_router.post("/auth/phone/verify")
301|async def verify_phone_send(request: PhoneVerifyRequest, user: User = Depends(require_auth)):
302|    """Send SMS verification code (Twilio) - Placeholder for now"""
303|    # TODO: Implement Twilio SMS when credentials are available
304|    return {
305|        "success": True, 
306|        "message": "SMS verification not yet configured. Please add Twilio credentials."
307|    }
308|
309|@api_router.post("/auth/phone/confirm")
310|async def verify_phone_confirm(request: PhoneVerifyCode, user: User = Depends(require_auth)):
311|    """Confirm SMS verification code - Placeholder for now"""
312|    # TODO: Implement Twilio verification when credentials are available
313|    return {
314|        "success": True,
315|        "message": "SMS verification not yet configured."
316|    }
317|
318|# ==================== TEAMS ROUTES ====================
319|
320|@api_router.post("/teams", response_model=Team)
321|async def create_team(team: TeamCreate, user: User = Depends(require_auth)):
322|    """Create a new team"""
323|    new_team = Team(**team.model_dump())
324|    team_dict = new_team.model_dump()
325|    team_dict['created_at'] = team_dict['created_at'].isoformat()
326|    await db.teams.insert_one(team_dict)
327|    return new_team
328|
329|@api_router.get("/teams", response_model=List[Team])
330|async def get_teams(country: Optional[str] = None):
331|    """Get all teams, optionally filter by country"""
332|    query = {} if not country else {"country": country}
333|    teams = await db.teams.find(query, {"_id": 0}).to_list(1000)
334|    
335|    for team in teams:
336|        if isinstance(team.get('created_at'), str):
337|            team['created_at'] = datetime.fromisoformat(team['created_at'])
338|    
339|    return teams
340|
341|@api_router.get("/teams/{team_id}", response_model=Team)
342|async def get_team(team_id: str):
343|    """Get team by ID"""
344|    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
345|    if not team:
346|        raise HTTPException(status_code=404, detail="Team not found")
347|    
348|    if isinstance(team.get('created_at'), str):
349|        team['created_at'] = datetime.fromisoformat(team['created_at'])
350|    
351|    return Team(**team)
352|
353|@api_router.put("/teams/{team_id}", response_model=Team)
354|async def update_team(team_id: str, team_update: TeamCreate, user: User = Depends(require_auth)):
355|    """Update team"""
356|    existing = await db.teams.find_one({"id": team_id})
357|    if not existing:
358|        raise HTTPException(status_code=404, detail="Team not found")
359|    
360|    update_dict = team_update.model_dump()
361|    await db.teams.update_one({"id": team_id}, {"$set": update_dict})
362|    
363|    updated_team = await db.teams.find_one({"id": team_id}, {"_id": 0})
364|    if isinstance(updated_team.get('created_at'), str):
365|        updated_team['created_at'] = datetime.fromisoformat(updated_team['created_at'])
366|    
367|    return Team(**updated_team)
368|
369|@api_router.delete("/teams/{team_id}")
370|async def delete_team(team_id: str, user: User = Depends(require_auth)):
371|    """Delete team"""
372|    result = await db.teams.delete_one({"id": team_id})
373|    if result.deleted_count == 0:
374|        raise HTTPException(status_code=404, detail="Team not found")
375|    return {"success": True}
376|
377|# ==================== TOURNAMENTS ROUTES ====================
378|
379|@api_router.post("/tournaments", response_model=Tournament)
380|async def create_tournament(tournament: TournamentCreate, user: User = Depends(require_auth)):
381|    """Create a new tournament"""
382|    new_tournament = Tournament(**tournament.model_dump())
383|    tournament_dict = new_tournament.model_dump()
384|    tournament_dict['created_at'] = tournament_dict['created_at'].isoformat()
385|    await db.tournaments.insert_one(tournament_dict)
386|    return new_tournament
387|
388|@api_router.get("/tournaments", response_model=List[Tournament])
389|async def get_tournaments():
390|    """Get all tournaments"""
391|    tournaments = await db.tournaments.find({}, {"_id": 0}).to_list(1000)
392|    
393|    for tournament in tournaments:
394|        if isinstance(tournament.get('created_at'), str):
395|            tournament['created_at'] = datetime.fromisoformat(tournament['created_at'])
396|    
397|    return tournaments
398|
399|@api_router.get("/tournaments/{tournament_id}", response_model=Tournament)
400|async def get_tournament(tournament_id: str):
401|    """Get tournament by ID"""
402|    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
403|    if not tournament:
404|        raise HTTPException(status_code=404, detail="Tournament not found")
405|    
406|    if isinstance(tournament.get('created_at'), str):
407|        tournament['created_at'] = datetime.fromisoformat(tournament['created_at'])
408|    
409|    return Tournament(**tournament)
410|
411|# ==================== TICKET SOURCES ROUTES ====================
412|
413|@api_router.post("/ticket-sources", response_model=TicketSource)
414|async def create_ticket_source(source: TicketSourceCreate, user: User = Depends(require_auth)):
415|    """Create a new ticket source"""
416|    new_source = TicketSource(**source.model_dump())
417|    source_dict = new_source.model_dump()
418|    source_dict['created_at'] = source_dict['created_at'].isoformat()
419|    await db.ticket_sources.insert_one(source_dict)
420|    return new_source
421|
422|@api_router.get("/ticket-sources", response_model=List[TicketSource])
423|async def get_ticket_sources():
424|    """Get all ticket sources"""
425|    sources = await db.ticket_sources.find({}, {"_id": 0}).to_list(1000)
426|    
427|    for source in sources:
428|        if isinstance(source.get('created_at'), str):
429|            source['created_at'] = datetime.fromisoformat(source['created_at'])
430|    
431|    return sources
432|
433|# ==================== MATCHES ROUTES ====================
434|
435|@api_router.post("/matches", response_model=Match)
436|async def create_match(match: MatchCreate, user: User = Depends(require_auth)):
437|    """Create a new match"""
438|    new_match = Match(**match.model_dump())
439|    match_dict = new_match.model_dump()
440|    match_dict['match_date'] = match_dict['match_date'].isoformat()
441|    if match_dict.get('ticket_sale_date'):
442|        match_dict['ticket_sale_date'] = match_dict['ticket_sale_date'].isoformat()
443|    match_dict['created_at'] = match_dict['created_at'].isoformat()
444|    match_dict['updated_at'] = match_dict['updated_at'].isoformat()
445|    await db.matches.insert_one(match_dict)
446|    return new_match
447|
448|@api_router.get("/matches", response_model=List[Match])
449|async def get_matches(
450|    team_id: Optional[str] = None,
451|    tournament_id: Optional[str] = None,
452|    ticket_available: Optional[bool] = None,
453|    upcoming: bool = False
454|):
455|    """Get all matches with optional filters"""
456|    query = {}
457|    
458|    if team_id:
459|        query["$or"] = [{"home_team_id": team_id}, {"away_team_id": team_id}]
460|    
461|    if tournament_id:
462|        query["tournament_id"] = tournament_id
463|    
464|    if ticket_available is not None:
465|        query["ticket_available"] = ticket_available
466|    
467|    if upcoming:
468|        query["match_date"] = {"$gte": datetime.now(timezone.utc).isoformat()}
469|    
470|    matches = await db.matches.find(query, {"_id": 0}).sort("match_date", 1).to_list(1000)
471|    
472|    for match in matches:
473|        if isinstance(match.get('match_date'), str):
474|            match['match_date'] = datetime.fromisoformat(match['match_date'])
475|        if isinstance(match.get('ticket_sale_date'), str):
476|            match['ticket_sale_date'] = datetime.fromisoformat(match['ticket_sale_date'])
477|        if isinstance(match.get('created_at'), str):
478|            match['created_at'] = datetime.fromisoformat(match['created_at'])
479|        if isinstance(match.get('updated_at'), str):
480|            match['updated_at'] = datetime.fromisoformat(match['updated_at'])
481|    
482|    return matches
483|
484|@api_router.get("/matches/{match_id}", response_model=Match)
485|async def get_match(match_id: str):
486|    """Get match by ID with full details"""
487|    match = await db.matches.find_one({"id": match_id}, {"_id": 0})
488|    if not match:
489|        raise HTTPException(status_code=404, detail="Match not found")
490|    
491|    if isinstance(match.get('match_date'), str):
492|        match['match_date'] = datetime.fromisoformat(match['match_date'])
493|    if isinstance(match.get('ticket_sale_date'), str):
494|        match['ticket_sale_date'] = datetime.fromisoformat(match['ticket_sale_date'])
495|    if isinstance(match.get('created_at'), str):
496|        match['created_at'] = datetime.fromisoformat(match['created_at'])
497|    if isinstance(match.get('updated_at'), str):
498|        match['updated_at'] = datetime.fromisoformat(match['updated_at'])
499|    
500|    return Match(**match)
501|
502|@api_router.put("/matches/{match_id}", response_model=Match)
503|async def update_match(match_id: str, match_update: MatchUpdate, user: User = Depends(require_auth)):
504|    """Update match (admin only)"""
505|    existing = await db.matches.find_one({"id": match_id})
506|    if not existing:
507|        raise HTTPException(status_code=404, detail="Match not found")
508|    
509|    update_dict = match_update.model_dump(exclude_unset=True)
510|    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
511|    
512|    if 'ticket_sale_date' in update_dict and update_dict['ticket_sale_date']:
513|        update_dict['ticket_sale_date'] = update_dict['ticket_sale_date'].isoformat()
514|    
515|    await db.matches.update_one({"id": match_id}, {"$set": update_dict})
516|    
517|    updated_match = await db.matches.find_one({"id": match_id}, {"_id": 0})
518|    if isinstance(updated_match.get('match_date'), str):
519|        updated_match['match_date'] = datetime.fromisoformat(updated_match['match_date'])
520|    if isinstance(updated_match.get('ticket_sale_date'), str):
521|        updated_match['ticket_sale_date'] = datetime.fromisoformat(updated_match['ticket_sale_date'])
522|    if isinstance(updated_match.get('created_at'), str):
523|        updated_match['created_at'] = datetime.fromisoformat(updated_match['created_at'])
524|    if isinstance(updated_match.get('updated_at'), str):
525|        updated_match['updated_at'] = datetime.fromisoformat(updated_match['updated_at'])
526|    
527|    return Match(**updated_match)
528|
529|@api_router.delete("/matches/{match_id}")
530|async def delete_match(match_id: str, user: User = Depends(require_auth)):
531|    """Delete match"""
532|    result = await db.matches.delete_one({"id": match_id})
533|    if result.deleted_count == 0:
534|        raise HTTPException(status_code=404, detail="Match not found")
535|    return {"success": True}
536|
537|# ==================== NOTIFICATIONS ROUTES ====================
538|
539|@api_router.get("/notifications", response_model=List[Notification])
540|async def get_notifications(user: User = Depends(require_auth), unread_only: bool = False):
541|    """Get user notifications"""
542|    query = {"user_id": user.id}
543|    if unread_only:
544|        query["read"] = False
545|    
546|    notifications = await db.notifications.find(query, {"_id": 0}).sort("sent_at", -1).to_list(1000)
547|    
548|    for notif in notifications:
549|        if isinstance(notif.get('sent_at'), str):
550|            notif['sent_at'] = datetime.fromisoformat(notif['sent_at'])
551|    
552|    return notifications
553|
554|@api_router.put("/notifications/{notification_id}/read")
555|async def mark_notification_read(notification_id: str, user: User = Depends(require_auth)):
556|    """Mark notification as read"""
557|    result = await db.notifications.update_one(
558|        {"id": notification_id, "user_id": user.id},
559|        {"$set": {"read": True}}
560|    )
561|    if result.modified_count == 0:
562|        raise HTTPException(status_code=404, detail="Notification not found")
563|    return {"success": True}
564|
565|@api_router.put("/notifications/mark-all-read")
566|async def mark_all_read(user: User = Depends(require_auth)):
567|    """Mark all notifications as read"""
568|    await db.notifications.update_many(
569|        {"user_id": user.id, "read": False},
570|        {"$set": {"read": True}}
571|    )
572|    return {"success": True}
573|
574|# ==================== USER PREFERENCES ROUTES ====================
575|
576|@api_router.get("/preferences", response_model=UserPreferences)
577|async def get_preferences(user: User = Depends(require_auth)):
578|    """Get user preferences"""
579|    prefs = await db.user_preferences.find_one({"user_id": user.id}, {"_id": 0})
580|    if not prefs:
581|        # Create default preferences
582|        new_prefs = UserPreferences(user_id=user.id)
583|        prefs_dict = new_prefs.model_dump()
584|        prefs_dict['created_at'] = prefs_dict['created_at'].isoformat()
585|        prefs_dict['updated_at'] = prefs_dict['updated_at'].isoformat()
586|        await db.user_preferences.insert_one(prefs_dict)
587|        return new_prefs
588|    
589|    if isinstance(prefs.get('created_at'), str):
590|        prefs['created_at'] = datetime.fromisoformat(prefs['created_at'])
591|    if isinstance(prefs.get('updated_at'), str):
592|        prefs['updated_at'] = datetime.fromisoformat(prefs['updated_at'])
593|    
594|    return UserPreferences(**prefs)
595|
596|@api_router.put("/preferences", response_model=UserPreferences)
597|async def update_preferences(preferences: UserPreferencesUpdate, user: User = Depends(require_auth)):
598|    """Update user preferences"""
599|    update_dict = preferences.model_dump(exclude_unset=True)
600|    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
601|    
602|    await db.user_preferences.update_one(
603|        {"user_id": user.id},
604|        {"$set": update_dict},
605|        upsert=True
606|    )
607|    
608|    updated_prefs = await db.user_preferences.find_one({"user_id": user.id}, {"_id": 0})
609|    if isinstance(updated_prefs.get('created_at'), str):
610|        updated_prefs['created_at'] = datetime.fromisoformat(updated_prefs['created_at'])
611|    if isinstance(updated_prefs.get('updated_at'), str):
612|        updated_prefs['updated_at'] = datetime.fromisoformat(updated_prefs['updated_at'])
613|    
614|    return UserPreferences(**updated_prefs)
615|
616|# ==================== CALENDAR EXPORT ====================
617|
618|@api_router.get("/matches/{match_id}/calendar")
619|async def export_to_calendar(match_id: str):
620|    """Export match to .ics calendar file"""
621|    match = await db.matches.find_one({"id": match_id}, {"_id": 0})
622|    if not match:
623|        raise HTTPException(status_code=404, detail="Match not found")
624|    
625|    # Get team names
626|    home_team = await db.teams.find_one({"id": match["home_team_id"]}, {"_id": 0})
627|    away_team = await db.teams.find_one({"id": match["away_team_id"]}, {"_id": 0})
628|    
629|    if isinstance(match.get('match_date'), str):
630|        match_date = datetime.fromisoformat(match['match_date'])
631|    else:
632|        match_date = match['match_date']
633|    
634|    # Create .ics file content
635|    ics_content = f"""BEGIN:VCALENDAR
636|VERSION:2.0
637|PRODID:-//Tickets Notify//EN
638|BEGIN:VEVENT
639|UID:{match_id}@ticketsnotify.com
640|DTSTART:{match_date.strftime('%Y%m%dT%H%M%S')}
641|DTEND:{(match_date + timedelta(hours=2)).strftime('%Y%m%dT%H%M%S')}
642|SUMMARY:{home_team['name']} vs {away_team['name']}
643|DESCRIPTION:Partido de fútbol\nVenue: {match['venue']}
644|LOCATION:{match['venue']}
645|STATUS:CONFIRMED
646|END:VEVENT
647|END:VCALENDAR"""
648|    
649|    # Return as downloadable file
650|    return StreamingResponse(
651|        BytesIO(ics_content.encode('utf-8')),
652|        media_type="text/calendar",
653|        headers={"Content-Disposition": f"attachment; filename=match_{match_id}.ics"}
654|    )
655|
656|# ==================== ROOT ROUTE ====================
657|
658|@api_router.get("/")
659|async def root():
660|    return {"message": "Football Tickets Notify API", "version": "1.0"}
661|
662|# Include the router in the main app
663|app.include_router(api_router)
664|
665|app.add_middleware(
666|    CORSMiddleware,
667|    allow_credentials=True,
668|    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
669|    allow_methods=["*"],
670|    allow_headers=["*"],
671|)
672|
673|# Configure logging
674|logging.basicConfig(
675|    level=logging.INFO,
676|    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
677|)
678|logger = logging.getLogger(__name__)
679|
680|@app.on_event("shutdown")
681|async def shutdown_db_client():
682|    client.close()
683|
