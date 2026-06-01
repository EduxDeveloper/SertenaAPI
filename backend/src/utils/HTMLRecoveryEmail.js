const HTMLRecoveryEmail = (code) => {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; background-color: #F9F9FA; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #F2F2F2; border-top: 6px solid #326BF9; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h1 style="color: #326BF9; font-size: 28px; margin-bottom: 15px; font-weight: 700;">Recuperación de Contraseña</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
          Hola, hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código de verificación para continuar:
        </p>
        
        <div style="display: inline-block; padding: 15px 30px; margin: 10px 0 25px; font-size: 26px; font-weight: bold; color: #FFFFFF; background-color: #00AB5B; border-radius: 8px; letter-spacing: 5px; box-shadow: 0 4px 10px rgba(0, 171, 91, 0.3);">
          ${code}
        </div>
        
        <div style="background-color: #F2F2F2; padding: 15px; border-radius: 6px; border-left: 4px solid #EAB308; margin-bottom: 20px; text-align: left;">
            <p style="font-size: 14px; color: #555; line-height: 1.5; margin: 0;">
              Este código es válido por los próximos <strong>15 minutos</strong>. Si no solicitaste este correo, puedes ignorarlo de forma segura.
            </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #F2F2F2; margin: 30px 0;">
        
        <footer style="font-size: 13px; color: #888;">
          Si necesitas más ayuda, por favor contacta a nuestro equipo de soporte en 
          <a href="mailto:soporte@sertena.com" style="color: #4D8AF4; text-decoration: none; font-weight: bold;">soporte@sertena.com</a>.
        </footer>
      </div>
    `;
};

export default HTMLRecoveryEmail;
