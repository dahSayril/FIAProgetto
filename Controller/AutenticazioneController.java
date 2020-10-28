package it.unisa.controller;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "/AutenticazioneController", urlPatterns = {"/authenticator", "/callback"})
public class AutenticazioneController extends HttpServlet {
	
	static Logger logger = Logger.getLogger("global");
	private static final long serialVersionUID = 1L;
	
	private final static String CLIENT_ID = "6f128e61cbfd4a1685ef77888a9d46fd";
	private final static String RESPONSE_TYPE = "code";
	private final static String REDIRECT_URI = "http://localhost:8080/FIAProgetto/callback"; 
	private final static String STATE = "34fFs29kd09";
	private final static String ACCESSO_RIFIUTATO = "access_denied";
	
    public AutenticazioneController() {
    
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		if(request.getServletPath().equals("/authenticator")) {
			
			String url = "https://accounts.spotify.com/authorize?client_id="
					+ CLIENT_ID
					+ "&response_type="
					+ RESPONSE_TYPE
					+ "&redirect_uri="
					+ REDIRECT_URI
					+ "&state="
					+ STATE;
			
			logger.info("Invio l'username alla pagina di log-in di spotify");
			response.sendRedirect(url);
			
		}
		
		else if(request.getServletPath().equals("/callback")) {
			
			String code = request.getParameter("code");
			String state = request.getParameter("state");
			String error = request.getParameter("error");
		
			if(error != null && error.equalsIgnoreCase(ACCESSO_RIFIUTATO)) {
				logger.severe("Accesso rifiutato!");
				return;
			}
			
			if(code != null && state != null) return;
			
			logger.info("Code e State ricevuti con successo!");
			
		}
		
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
		
}
