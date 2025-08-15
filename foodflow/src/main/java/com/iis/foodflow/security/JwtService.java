// package com.iis.foodflow.security;
package com.iis.foodflow.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority; // <-- Potreban import
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap; // <-- Potreban import
import java.util.Map; // <-- Potreban import
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // === GLAVNA PROMJENA JE OVDJE ===
    // Ova metoda sada priprema podatke i poziva drugu, preopterećenu metodu.
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();

        // Uzimamo prvu autorizaciju (ulogu) iz liste.
        // Vaša Role enum vraća string poput "ROLE_DRIVER", "ROLE_CUSTOMER", itd.
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(""); // Ukoliko korisnik nema ulogu, biće prazan string

        // Stavljamo ulogu u mapu pod ključem "role".
        // Ovaj ključ ("role") je VAŽAN jer ćete ga koristiti na frontendu.
        extraClaims.put("role", role);
        if (userDetails instanceof com.iis.foodflow.model.user.Manager) {
            extraClaims.put("id", ((com.iis.foodflow.model.user.Manager) userDetails).getId());
        }

        return generateToken(extraClaims, userDetails);
    }

    // === KREIRALI SMO NOVU, PREOPTEREĆENU (OVERLOADED) METODU ===
    // Ona prima dodatne podatke (extraClaims) i ugrađuje ih u token.
    private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims) // <-- Ovdje dodajemo našu mapu sa ulogom
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    // ==========================================================


    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}