#include <SPI.h>
#include <RH_ASK.h>
#include <RH_Serial.h>
#include <RHReliableDatagram.h>

RH_ASK radio(2000, 2, 4);

RH_Serial serial(Serial);

void setup()
{
  Serial.begin(9600);
  if (!radio.init())
    Serial.println("radio init failed");

  radio.setPromiscuous(true);

  if (!serial.init())
    Serial.println("serial init failed");

  serial.setPromiscuous(true);

}

uint8_t buf[RH_SERIAL_MAX_MESSAGE_LEN];

void loop()
{
  if (radio.available())
  {
    uint8_t len = sizeof(buf);
    radio.recv(buf, &len);

    serial.setHeaderTo(radio.headerTo());
    serial.setHeaderFrom(radio.headerFrom());
    serial.setHeaderId(radio.headerId());
    serial.setHeaderFlags(radio.headerFlags(), 0xFF);
    serial.send(buf, len);
  }

  if (serial.available())
  {
    uint8_t len = sizeof(buf);
    serial.recv(buf, &len);

    // Optional: Nachrichten nach Adresse filtern
    // Kommentar vor den folgenden Zeilen entfernen, um nur Nachrichten an Adressen 0xC0 oder höher weiterzuleiten.
    // if(serial.headerTo() < 0xC0){
    //  return;
    // }

    radio.setHeaderTo(serial.headerTo());
    radio.setHeaderFrom(serial.headerFrom());
    radio.setHeaderId(serial.headerId());
    radio.setHeaderFlags(serial.headerFlags(), 0xFF);
    radio.send(buf, len);
  }
}
