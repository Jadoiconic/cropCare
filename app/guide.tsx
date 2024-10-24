import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const RwandaCropCareGuide = () => {
  // Define state to toggle between the User Manual and User Journey views
  const [currentView, setCurrentView] = useState<'manual' | 'journey'>('manual');

  // User Manual content
  const UserManual = () => (
    <ScrollView>
      <Text style={styles.title}>Igitabo cy'Imikoreshereze - Rwanda CropCare App</Text>
      <Text style={styles.sectionTitle}>1. Kwinjira Muri App (Login)</Text>
      <Text style={styles.paragraph}>
        Umuhinzi cyangwa Umukozi usanzwe afite konti ashobora kwinjira akoresheje nimero ye ya telefoni na password.
        Niba utaribaruye, ukoresha uburyo bwo kwiyandikisha, aho ushyiramo amakuru yawe y’ibanze.
      </Text>

      <Text style={styles.sectionTitle}>2. Gukoresha Amakuru (Dashboard)</Text>
      <Text style={styles.paragraph}>
        Nyuma yo kwinjira, ubonera imbere yawe urutonde rw’ibikorwa bigufasha gukurikirana umusaruro wawe,
        harimo gutegura igihe cyo gutera, gushyiramo ifumbire, kuvomerera, n’ibindi bikorwa by’ubuhinzi.
      </Text>

      <Text style={styles.sectionTitle}>3. Gushyiraho Ibibutsa (Set Reminder)</Text>
      <Text style={styles.paragraph}>
        Ushobora gushyiraho ibyo kwibutsa bikorwa by’ingenzi bikenewe gukora igihe runaka nko kuvomerera,
        gushyira ifumbire, gutera, cyangwa gukurikirana uburwayi bw'imyaka.
      </Text>

      <Text style={styles.sectionTitle}>4. Amakuru y'Iteganyagihe (Weather Information)</Text>
      <Text style={styles.paragraph}>
        Iyi app ikwereka iteganyagihe rigezweho ku gace uriho, bigufasha kumenya uko ugomba gutegura imirimo yawe y’ubuhinzi.
      </Text>

      <Text style={styles.sectionTitle}>5. Ibiganiro hagati y'Abahinzi n'Impuguke (Chat)</Text>
      <Text style={styles.paragraph}>
        Hari uburyo bwo kuganira hagati y’abahinzi n’impuguke aho ushobora kubaza ibibazo cyangwa kubona ubufasha
        ku bijyanye n’uburwayi bw’imyaka, imiti, cyangwa ubuhinzi muri rusange.
      </Text>
    </ScrollView>
  );

  // User Journey content
  const UserJourney = () => (
    <ScrollView>
      <Text style={styles.title}>Inzira Umukoresha Anyuramo Muri Rwanda CropCare App</Text>
      
      <Text style={styles.sectionTitle}>1. Kwiyandikisha cyangwa Kwinjira</Text>
      <Text style={styles.paragraph}>
        Umukoresha mushya ahitamo kwiyandikisha akoresheje nimero ya telefoni na password.
        Naho umukoresha usanzwe ahita yinjira akoresheje nimero ye na password. Nyuma yo kwinjira, umukoresha abona
        urutonde rw'ibikorwa bihari.
      </Text>

      <Text style={styles.sectionTitle}>2. Gutangira Gukoresha App</Text>
      <Text style={styles.paragraph}>
        Nyuma yo kwinjira muri app, umukoresha ahita abona ibice bitandukanye nka: Iteganyagihe, Ibikorwa by’ubuhinzi
        (gushyiraho ibyo kwibutsa), ibiganiro hagati y’abahinzi n’impuguke, n’ibindi. Ibi byose bigamije gufasha
        gukurikirana neza ubuhinzi.
      </Text>

      <Text style={styles.sectionTitle}>3. Gukoresha Ibiganiro</Text>
      <Text style={styles.paragraph}>
        Umuhinzi ashobora kwinjira mu kiganiro (chat) hagati ye n’impuguke kugira ngo abone ubufasha bwihariye
        mu buhinzi. Ubu buryo bufasha abahinzi guhabwa inama zijyanye n'ubuhinzi bwabo no gusubiza ibibazo.
      </Text>

      <Text style={styles.sectionTitle}>4. Gukurikirana Ibihe by'Ubuhinzi</Text>
      <Text style={styles.paragraph}>
        Umukoresha ashobora gukurikirana igihe cyo gutera, gukoresha ifumbire, kwirinda indwara n’ibyonnyi,
        byose binyuzwa muri gahunda ya app. Hari n’amakuru ahita atangwa igihe cy’ingenzi gikenewe nk'iteganyagihe.
      </Text>

      <Text style={styles.sectionTitle}>5. Guhabwa Amakuru Kuri Sezoni y’Ihinga</Text>
      <Text style={styles.paragraph}>
        App itanga amakuru ajyanye na sezoni y'ihinga iriho n’ibikorwa bigomba gukorwa mu gihe runaka.
        Amakuru ku mbuto nziza, ifumbire, n’ibikorwa by’ingenzi bikubwira neza ibikenewe gukora.
      </Text>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Buttons to switch between User Manual and User Journey */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, currentView === 'manual' && styles.activeTab]}
          onPress={() => setCurrentView('manual')}
        >
          <Text style={styles.tabText}>Igitabo cy'Imikoreshereze</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, currentView === 'journey' && styles.activeTab]}
          onPress={() => setCurrentView('journey')}
        >
          <Text style={styles.tabText}>Inzira Umukoresha Anyuramo</Text>
        </TouchableOpacity>
      </View>

      {/* Render the content based on selected state */}
      {currentView === 'manual' ? <UserManual /> : <UserJourney />}
    </View>
  );
};

// Styles for layout and design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: '#4CAF50', // Active tab background color
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
    textAlign: 'justify',
  },
});

export default RwandaCropCareGuide;
