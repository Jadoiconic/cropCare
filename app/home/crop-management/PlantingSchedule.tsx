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
            Igihembwe A ritangira mu kwezi kwa Nzeli rigasozwa muri Mutarama. Ni igihe cy’imvura nkeya, gikwiranye n’imyaka nk’ibigori n’ibirayi. Gutera bikorwa hagati muri Nzeli no mu ntangiriro z’Ukwakira.
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
                <Text style={styles.tableRowText}>{schedules.potatoes[index].date}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Padding at the Bottom to Prevent Overlap */}
      <View style={styles.bottomSpacing} />

      {/* Button */}
      <TouchableOpacity style={styles.reminderButton} onPress={() => router.push('/home/crop-management/setReminder')}>
        <Text style={styles.reminderButtonText}>Shyiraho Urwibutso</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
    paddingBottom: 100, // Added bottom padding to avoid button overlap
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22', // Dark Green for Section Titles
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#32CD32', // Bright Green for Subsection Titles
    marginTop: 12,
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#228B22', // Dark Green for Emphasis
  },
  table: {
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#228B22',
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
    color: '#333333',
  },
  bottomSpacing: {
    height: 100, // Space at the bottom to avoid button overlap
  },
  reminderButton: {
    backgroundColor: '#228B22',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 32,
    position: 'absolute',
    bottom: 20,
    left: '25%',
    right: '25%',
    alignItems: 'center',
  },
  reminderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default FarmingGuideScreen;
