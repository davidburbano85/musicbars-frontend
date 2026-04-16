import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';



export interface Video {
  idMesa: number;
  titulo: string;
  linkVideo: string;
  nombreCancion: string;
  idVideoYoutube: string;

}
@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private youtubeApiKey = 'AIzaSyBwNryvdSuM1OtInUdEHwnyjm5MSLIbKkQ';
  // URL base del backend para videos
  private apiUrl = 'https://musicbares-backend.onrender.com/api/VideoMesa';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  colaVideos(idBar: number): Observable<Video[]> {
    const token = localStorage.getItem('access_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log("colavideos[VIDEOSERVICES] IDbAR", idBar);

    const url = `${this.apiUrl}/cola/${idBar}`;
    this.http.get<Video[]>(`${this.apiUrl}/cola/${idBar}`).subscribe(console.log, console.error);
    return this.http.get<Video[]>(url, { headers });
  }
  obtenerTituloVideo(idVideo: string): Observable<string> {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${idVideo}&key=${this.youtubeApiKey}`;
    return this.http.get<{ items: { snippet: { title: string } }[] }>(url) // Tipado explícito
      .pipe(
        map((resp) => { // Tipo de resp definido
          if (resp.items && resp.items.length > 0) {
            return resp.items[0].snippet.title; // Devuelve el título
          } else {
            return 'Título no encontrado';
          }
        })
      );
  }



  // ================================================
  // MÉTODO PRIVADO: Construye headers con token JWT de Supabase
  // ================================================
  private getAuthHeaders(): HttpHeaders {

    const rawToken = localStorage.getItem('sb-auth-token');
    let token = '';

    if (rawToken) {
      try {
        const parsed = JSON.parse(rawToken);
        token = parsed.access_token || '';
      } catch (err) {
        //console.error('[VideoService] Error parseando token:', err);
      }
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ================================================
  // 1️⃣ Registrar videos desde la mesa (sin token)
  // ================================================
  registrarVideosMesa(codigoMesa: string, links: string[]): Observable<any> {

    // 🔹 Chequeo de sesión antes de enviar
    // if (!this.authService.estaAutenticado()) {
    //   return throwError(() => new Error('Usuario no autenticado, no se puede enviar canciones'));
    // }
    const codigoFormateado = `https://musicbars.onrender.com/mesa/${codigoMesa}`;
    console.log('[VideoService] ENVIANDO registrarVideosMesa');
    console.log('[VideoService] codigoMesa:', codigoMesa);
    console.log('[VideoService] links:', links);
    console.log('[VideoService] URL:', `${this.apiUrl}/registrar-multiples`);
    const body = { codigoMesa:codigoFormateado, links };
    console.log('[VideoService] BODY ENVIADO:', body);
    return this.http.post(`${this.apiUrl}/registrar-multiples`, body);
  }

  // ================================================
  // 2️⃣ Obtener siguiente video (requiere token)
  // ================================================
  obtenerSiguienteVideo(idBar: number): Observable<any> {

    // 🔹 Obtenemos token real desde Supabase localStorage
    const token = this.obtenerTokenSupabase();

    // console.log('[VideoService] obtenerSiguienteVideo -> token detectado:', token);

    // 🔹 Creamos headers SIEMPRE con Authorization
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // console.log('[VideoService] obtenerSiguienteVideo -> headers:', headers);

    const url = `${this.apiUrl}/siguiente/${idBar}`;

    // console.log('[VideoService] obtenerSiguienteVideo -> URL:', url);

    return this.http.get(url, { headers });
  }

  // ================================================
  // 3️⃣ Eliminar video
  // ================================================
  eliminarVideo(idVideo: number): Observable<any> {

    const headers = this.construirHeaders();

    // console.log('[VideoService] eliminarVideo -> headers:', headers);

    return this.http.delete(`${this.apiUrl}/${idVideo}`, { headers });
  }

  // ================================================
  // 🔐 MÉTODO CENTRAL: obtiene token real de Supabase
  // ================================================
  private obtenerTokenSupabase(): string {

    // Supabase guarda sesión como JSON en "sb-auth-token"
    const raw = localStorage.getItem('sb-auth-token');

    // console.log('[VideoService] obtenerTokenSupabase -> raw token:', raw);

    if (!raw) {
      // console.warn('[VideoService] No existe sesión Supabase en localStorage');
      return '';
    }

    try {

      const parsed = JSON.parse(raw);

      const token = parsed?.access_token || '';

      // console.log('[VideoService] Token extraído correctamente:', token);

      return token;

    } catch (err) {

      // console.error('[VideoService] Error parseando token Supabase:', err);
      return '';
    }
  }

  // ================================================
  // 🔐 Construye headers reutilizables
  // ================================================
  private construirHeaders(): HttpHeaders {

    const token = this.obtenerTokenSupabase();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // console.log('[VideoService] construirHeaders -> headers:', headers);

    return headers;
  }
  // ================================================
  // 6️⃣ Marcar video como iniciado (cuando YA empezó a reproducirse)
  // Este endpoint debe existir en tu backend
  // ================================================
  marcarVideoIniciado(idYoutube: string): Observable<any> {

    // console.log('[VideoService] marcarVideoIniciado -> idYoutube:', idYoutube);

    // Obtenemos headers con token JWT real
    const headers = this.getAuthHeaders();
    // console.log('[VideoService] marcarVideoIniciado -> Headers:', headers);

    // 🔴 AJUSTA ESTA RUTA SEGÚN TU BACKEND
    const url = `${this.apiUrl}/marcar-iniciado/${idYoutube}`;

    //  console.log('[VideoService] marcarVideoIniciado -> URL:', url);

    // Enviamos PUT vacío (solo para cambiar estado)
    return this.http.put(url, {}, { headers });
  }

}
