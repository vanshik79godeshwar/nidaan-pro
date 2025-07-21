package com.nidaanpro.chat_service.interceptor;

import com.nidaanpro.chat_service.util.JwtUtil;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    public AuthChannelInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authorization = accessor.getNativeHeader("Authorization");

            if (authorization == null || authorization.isEmpty()) {
                throw new SecurityException("No Authorization header found");
            }

            String token = authorization.get(0);
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            try {
                String userId = jwtUtil.getUserIdFromToken(token);
                Authentication auth = new UsernamePasswordAuthenticationToken(userId, null, null);
                accessor.setUser(auth);
            } catch (Exception e) {
                throw new SecurityException("Invalid JWT: " + e.getMessage());
            }
        }
        return message;
    }
}