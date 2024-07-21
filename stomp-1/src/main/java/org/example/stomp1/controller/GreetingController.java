package org.example.stomp1.controller;

import org.example.stomp1.message.Greeting;
import org.example.stomp1.message.HelloMessage;
import org.example.stomp1.message.Join;
import org.example.stomp1.message.Note;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.converter.SimpleMessageConverter;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class GreetingController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Greeting greeting(HelloMessage message) throws Exception {
        Thread.sleep(1000); // simulated delay
        return new Greeting("Hello, " + HtmlUtils.htmlEscape(message.getName()) + "!");
    }

    @MessageMapping("/memo")
    @SendTo("/topic/common")
    public Greeting shareMemo(Note note)throws Exception {
        System.out.println(note.getContent());
        return new Greeting(HtmlUtils.htmlEscape(note.getContent()));
    }

    @MessageMapping("/join")
    public void joinChat(Join member) {
        System.out.println(member.getUsername());
        int chatRoomId=member.getRoomId();
        System.out.println(chatRoomId);
        simpMessagingTemplate.convertAndSend("/topic/chatRoom/" + chatRoomId,member.getUsername() + " joined the chat room " + chatRoomId);
    }

}
