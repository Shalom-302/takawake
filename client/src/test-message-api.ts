// Script de test pour l'API de messagerie
// Ce script peut être exécuté avec ts-node

import fetch from "node-fetch";

async function testMessageCreation() {
    // Remplacer ces valeurs par des valeurs valides
    const conversationId = "CONVERSATION_ID";
    const token = "TOKEN";
    const content = "Test message";

    // Test 1: Envoi JSON standard
    try {
        console.log("=== TEST 1: Envoi JSON standard ===");
        const messageData = {
            conversation_id: conversationId,
            message_type: "text",
            content: content,
        };

        const response1 = await fetch("http://localhost:8000/messaging/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(messageData),
        });

        console.log(`Status: ${response1.status}`);
        const responseText1 = await response1.text();
        console.log(`Response: ${responseText1}`);
    } catch (error) {
        console.error("Error in Test 1:", error);
    }

    // Test 2: Envoi avec message_data
    try {
        console.log("\n=== TEST 2: Envoi avec message_data ===");
        const messageData = {
            conversation_id: conversationId,
            message_type: "text",
            content: content,
        };

        const response2 = await fetch("http://localhost:8000/messaging/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message_data: messageData }),
        });

        console.log(`Status: ${response2.status}`);
        const responseText2 = await response2.text();
        console.log(`Response: ${responseText2}`);
    } catch (error) {
        console.error("Error in Test 2:", error);
    }

    // Test 3: Envoi FormData
    try {
        console.log("\n=== TEST 3: Envoi FormData ===");
        const formData = new FormData();
        const messageData = {
            conversation_id: conversationId,
            message_type: "text",
            content: content,
        };

        formData.append("message_data", JSON.stringify(messageData));

        const response3 = await fetch("http://localhost:8000/messaging/messages", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        console.log(`Status: ${response3.status}`);
        const responseText3 = await response3.text();
        console.log(`Response: ${responseText3}`);
    } catch (error) {
        console.error("Error in Test 3:", error);
    }
}

// Exécuter les tests
testMessageCreation().catch(console.error);
