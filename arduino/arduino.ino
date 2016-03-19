const int pin = 7;

void setup () {
  Serial.begin(115200);
}

void loop () {
  long duration;
  
  // send out a radar pulse
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  delayMicroseconds(2);
  digitalWrite(pin, HIGH);
  delayMicroseconds(5);
  digitalWrite(pin, LOW);
  
  // read the duration of the pulse
  pinMode(pin, INPUT);
  duration = pulseIn(pin, HIGH);
  
  Serial.println(microsecondsToInches(duration)); 
  
  delay(100);
}

long microsecondsToInches (long microseconds) {
  return microseconds / 74 / 2;
}
