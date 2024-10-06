import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';

const Maize = () => {
    const [searchText, setSearchText] = useState('');

    // Data for the sections (could be moved outside the component)
    const sections = [
        { id: 1, title: "1. Gukurikirana no Gusuzuma Ubutaka (Soil Testing)", content: "Ubutaka bwiza ku bihingwa by’ibigori..." },
        { id: 2, title: "2. Imbuto Ziza Zibigori (Maize Seed Selection)", content: "Hitamo imbuto zemewe kandi zikwiye ku rwego rw’ahantu..." },
        { id: 3, title: "3. Gutunganya Umurima (Land Preparation)", content: "Tegura umurima neza uhereye ku gukuramo ibyatsi..." },
        { id: 4, title: "4. Gufumbira Ibigori", content: "Nitrogen (N): Ifumbire ya Urea cyangwa Ammonium Sulfate..." },
        { id: 5, title: "5. Uburyo bwo Gukoresha Ifumbire (Application Methods)", content: "Gushyira ifumbire ku Buso Bwose..." },
        { id: 6, title: "6. Igihe Nyacyo cyo Gufumbira (Fertilizer Timing)", content: "Nyuma yo gutera: Shyira ifumbire ya DAP cyangwa NPK..." },
        { id: 7, title: "7. Gucunga no Gukurikirana Ifumbire (Fertilizer Monitoring)", content: "Kugenzura Iterambere ry’Ibigori: Jya ugenda ureba uko ibigori..." },
        { id: 8, title: "8. Ibindi Byitonderwa", content: "Kwirinda Gukoresha Ifumbire Nyinshi..." },
        { id: 9, title: "9. Gukoresha Ifumbire Yiyongera (Supplementary Fertilizers)", content: "Compost Tea: Uretse ifumbire mvaruganda..." },
        { id: 10, title: "10. Kwita ku Ndwara n’Udukoko", content: "Kugenzura: Jya ureba niba ibigori byawe..." },
        { id: 11, title: "11. Kubahiriza Amabwiriza y'Igihe cyo Gusarura (Harvesting Time)", content: "Igihe cyo gusarura: Gusarura neza bigomba gukorwa ibigori..." },
    ];

    // Filter the sections based on search input
    const filteredSections = sections.filter(section =>
        section.title.toLowerCase().includes(searchText.toLowerCase()) ||
        section.content.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Shakisha mu bigori..."
                value={searchText}
                onChangeText={setSearchText}
            />

            {/* Main Title */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Ibigori</Text>

                {/* Introductory Text */}
                <Text style={styles.introduction}>
                    Uburyo Bwo Gufumbira Ibigori mu Rwanda Hagendewe ku Mabwiriza ya RAB
                </Text>

                {/* Filtered Sections */}
                {filteredSections.map((section) => (
                    <View key={section.id}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.paragraph}>{section.content}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F8F8F8',
    },
    searchBar: {
        height: 40,
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 16,
        textAlign: 'center',
    },
    introduction: {
        fontSize: 18,
        fontWeight: '600',
        color: '#388E3C',
        marginVertical: 10,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#388E3C',
        marginVertical: 10,
    },
    paragraph: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 8,
    },
});

export default Maize;
