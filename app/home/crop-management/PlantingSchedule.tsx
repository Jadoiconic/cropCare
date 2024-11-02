import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const FarmingGuideScreen = () => {
  const router = useRouter();

  const schedules = {
    maize: [
      { task: 'Gutera Ibigori', date: 'Nzeli 15 - Ukwakira 10 (Igihembwe A)' },
      { task: 'Kurandura ibyatsi', date: 'Ukwakira 25' },
      { task: 'Gufumbira', date: 'Ukwakira 20' },
      { task: 'Gusarura', date: 'Mutarama 20 - Gashyantare 5' },
    ],
    potatoes: [
      { task: 'Gutera Ibirayi', date: 'Nzeli 15 - Ukwakira 5 (Igihembwe A)' },
      { task: 'Kuzunguza ibirayi', date: 'Ugushyingo 15' },
      { task: 'Gufumbira', date: 'Ukwakira 10' },
      { task: 'Gusarura', date: 'Mutarama 20 - Gashyantare 5' },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Farming Seasons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ibihembwe by'Ubuhinzi mu Rwanda</Text>
          <Text style={styles.content}>
            Mu Rwanda hari ibihembwe by’ingenzi by’ubuhinzi bibiri:
          </Text>
          <Text style={styles.subSectionTitle}>1. Igihembwe A (Nzeli - Mutarama)</Text>
          <Text style={styles.content}>
            Igihembwe A ritangira mu kwezi kwa Nzeli rigasozwa muri Mutarama. Ni igihe cy’imvura nkeya, gikwiranye n’imyaka nk'ibgori n'ibirayi. Gutera bikorwa hagati muri Nzeli no mu ntangiriro z’Ukwakira.
          </Text>
          <Text style={styles.subSectionTitle}>2. Igihembwe B (Gashyantare - Kamena)</Text>
          <Text style={styles.content}>
            Igihembwe B gitangira muri Gashyantare kigasoza muri Kamena. Iki gihe ni igihe cy’imvura nyinshi, kikaba gikwiranye n’imyaka myinshi. Gutera bikorwa hagati muri Gashyantare.
          </Text>
          <Text style={styles.subSectionTitle}>3. Igihembwe C (Kamena - Kanama)</Text>
          <Text style={styles.content}>
            Hari aho bahinga n’igihembwe gito, cyizwi nka C, gitangira muri Kamena kikageza Kanama, cyane cyane ku bihingwa byihuta nk'imboga.
          </Text>
        </View>

        {/* Planting Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amatariki Meza yo Gutera</Text>

          {/* Maize Planting Dates */}
          <Text style={styles.subSectionTitle}>Ibigori</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>Igihembwe A:</Text> Amatariki Meza: Nzeli 15 - Ukwakira 10.{"\n"}
            <Text style={styles.bold}>Igihembwe B:</Text> Amatariki Meza: Gashyantare 1 - Gashyantare 15.
          </Text>

          {/* Potato Planting Dates */}
          <Text style={styles.subSectionTitle}>Ibirayi</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>Igihembwe A:</Text> Amatariki Meza: Nzeli 15 - Ukwakira 5.{"\n"}
            <Text style={styles.bold}>Igihembwe B:</Text> Amatariki Meza: Gashyantare 1 - Gashyantare 10.
          </Text>
        </View>

        {/* Pest and Disease Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kwirinda Ibyonnyi n'Indwara</Text>

          {/* Maize Pests and Diseases */}
          <Text style={styles.subSectionTitle}>Ibigori</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>Inyenzi z'Ibigori:</Text> Shyiraho umuti wa Emamectin Benzoate nyuma y’ibyumweru 2-3 wateye.{"\n"}
            <Text style={styles.bold}>Ikirya insina:</Text> Shyiraho umuti wa Chlorpyrifos nyuma y’ibyumweru 2.{"\n"}
            <Text style={styles.bold}>Indwara y’Ibirai:</Text> Koresha umuti wa Azoxystrobin ubonye ibimenyetso.
          </Text>

          {/* Potato Pests and Diseases */}
          <Text style={styles.subSectionTitle}>Ibirayi</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>Icyohe:</Text> Shyiraho Mancozeb nyuma y’iminsi 7-10 uteye.{"\n"}
            <Text style={styles.bold}>Inyenzi z’ibirayi:</Text> Koresha Oxamyl igihe uteye no mugihe bikura.{"\n"}
            <Text style={styles.bold}>Inyenzi:</Text> Shyiraho umuti wa Imidacloprid nyuma y’ibyumweru 2-3 uteye.
          </Text>
        </View>

        {/* Best Practices Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amabwiriza Meza yo Guhinga</Text>

          {/* Maize Best Practices */}
          <Text style={styles.subSectionTitle}>Ibigori</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>Gushyira ifumbire:</Text> Fumbira na NPK (17:17:17) ku itariki ya Ukwakira 25.{"\n"}
            <Text style={styles.bold}>Gufumbira Urea:</Text> Shyiraho Urea muri Nzeli kugirango ibigori bikure neza.{"\n"}
            <Text style={styles.bold}>Kurandura ibyatsi:</Text> Banza kurandura mbere y’Ukwakira 25.
          </Text>

          {/* Potato Best Practices */}
          <Text style={styles.subSectionTitle}>Ibirayi</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>Gushyira ifumbire:</Text> Fumbira na NPK (17:17:17) mbere y’Ukwakira 10.{"\n"}
            <Text style={styles.bold}>Kuzunguza Ibirayi:</Text> Kuzunguza ku itariki ya Ugushyingo 15.{"\n"}
            <Text style={styles.bold}>Koresha umuti:</Text> Shyiraho umuti wa Mancozeb kuri Ukwakira 25.
          </Text>
        </View>

        {/* Recommended Seeds Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amahundo Meza y’Imbuto</Text>

          {/* Maize Seeds */}
          <Text style={styles.subSectionTitle}>Ibigori</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>H520 (Hybrid):</Text> Ifite umusaruro mwinshi kandi ishobora guhangana n'amapfa.{"\n"}
            <Text style={styles.bold}>Katumani:</Text> Ibereye ahantu hatabona imvura nyinshi.
          </Text>

          {/* Potato Seeds */}
          <Text style={styles.subSectionTitle}>Ibirayi</Text>
          <Text style={styles.content}>
            <Text style={styles.bold}>Shangi:</Text> Imbuto yera vuba kandi itanga umusaruro mwiza.{"\n"}
            <Text style={styles.bold}>Dutch Robjin:</Text> Ifite ubushobozi bwo guhangana n’indwara.
          </Text>
        </View>

        {/* Farming Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Igenamigambi ry'Ubuhinzi</Text>

          {/* Schedule Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Akazi</Text>
              <Text style={styles.tableHeaderText}>Amatariki Ibigori</Text>
              <Text style={styles.tableHeaderText}>Amatariki Ibirayi</Text>
            </View>
            {schedules.maize.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableRowText}>{item.task}</Text>
                <Text style={styles.tableRowText}>{item.date}</Text>
                <Text style={styles.tableRowText}>{schedules.potatoes[index]?.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Schedule Crop Button */}
      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => router.push('/home/crop-management/CropTaskScheduler')}
      >
        <Text style={styles.scheduleButtonText}>Gena Igenamigambi</Text>
      </TouchableOpacity>

      {/* Set Reminder Button */}
      <TouchableOpacity
        style={styles.reminderButton}
        onPress={() => router.push('/home/crop-management/setReminder')}
      >
        <Text style={styles.reminderButtonText}>Shyiraho Urwibutso</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative', // Position relative for absolute children
  },
  scrollView: {
    padding: 16,
    paddingBottom: 140, // Add bottom padding to avoid content being hidden under buttons
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  content: {
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRowText: {
    flex: 1,
    textAlign: 'center',
  },
  scheduleButton: {
    position: 'absolute', // Fix position
    bottom: 80, // Distance from the bottom
    left: 16,
    right: 16,
    backgroundColor: '#4CAF50', // Change to your preferred color
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderButton: {
    position: 'absolute', // Fix position
    bottom: 20, // Distance from the bottom
    left: 16,
    right: 16,
    backgroundColor: '#4CAF50', // Change to your preferred color
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reminderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FarmingGuideScreen;
