import { PanelComponent } from './../../panel/panel.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, } from '../../../core/servicios/auth.service';
// validacion.component.ts (imports)

@Component({
  selector: 'app-validacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validacion.component.html',
  styleUrl: './validacion.component.scss'
})
export class ValidacionComponent implements OnInit {

  loginForm: FormGroup;

  email: string = "";
  comunicarConWA=false;

  constructor(private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private cd: ChangeDetectorRef  // 

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],   // Email obligatorio y con formato válido
      password: ['', Validators.required]                     // Password obligatorio
    });
  }
  ngOnInit(): void {
    const email = localStorage.getItem('usuarioEmail');
    if (!email) return;
    this.email = email;

  }


  iniciarSesi = false;

  iniciarSesion() {
    const { email, password } = this.loginForm.value;
    // Llamamos al servicio para iniciar sesión en Supabase
    this.authService.iniciarSesion(email, password).subscribe({});

  }
  validarInicio(primerBloque: number, segundoBloque: number) {
    const primBloqueCorrecto = 8512;
    const segBloqueCorrecto = 3886;

    if (primerBloque === primBloqueCorrecto && segundoBloque === segBloqueCorrecto) {
      console.log('[VALIDACION] Bloques correctos, redirigiendo a panel...');
      // Limpiamos valores si quieres
      primerBloque = 0;
      segundoBloque = 0;
      this.iniciarSesi = true
      this.comunicarConWA=false;
      // 🔹 Redirigimos automáticamente al PanelComponent
      this.router.navigate(['/panel']);
    } else {
      console.warn('[VALIDACION] Bloques incorrectos');
      // Opcional: mostrar mensaje de error
    }
  }

  comunicarWA() {

    const telefono = '573135249496'; // 🔹 Cambia por tu número real con código país
    const emailUsuario = this.email || this.loginForm.get('email')?.value || 'No proporcionado';
    this.comunicarConWA=true;
    const mensaje = `
      Hola, quiero validar mi acceso.
      Email: ${emailUsuario}
      Fecha: ${new Date().toLocaleString()}
        `;

    const mensajeCodificado = encodeURIComponent(mensaje.trim());

    const url = `https://wa.me/${telefono}?text=${mensajeCodificado}`;

    window.open(url, '_blank');
  }
}

