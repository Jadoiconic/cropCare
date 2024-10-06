import { StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';

const Maize = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Sample data to filter
    const contentData = [
        {
            title: 'Uburyo bwo Kurwanya Indwara n’Ibyonnyi mu Buhiinzi bw\'Ibigori Hagendewe ku Mabwiriza ya RAB',
            paragraphs: [
                'Kurwanya indwara n’ibyonnyi byibasira ibigori ni ingenzi mu kuzamura umusaruro w’ibigori. Ibigori bishobora kwibasirwa n’indwara nyinshi, kandi ibyonnyi bishobora kugira ingaruka zikomeye ku musaruro w’umuhinzi. Uko utangira gutegura umurima n\'uburyo wakwitwara mu mikurire y’ibigori bifasha gukumira ibyo bibazo hakiri kare. Reka turebere hamwe mu buryo burambuye uburyo bwo kurwanya indwara n’ibyonnyi mu buhinzi bw\'ibigori.',
            ],
        },
        {
            title: '1. Indwara Zibasira Ibigori',
            paragraphs: [
                'a. Imvura y\'Uruvuye (Maize Leaf Blight): Iterwa n’agahumyo ka Exserohilum turcicum. Iyi ndwara igaragara cyane mu bihugu by’imvura nyinshi. Ibimenyetso: Ibigori bifite ibibara by\'icyatsi kibisi cyijimye ku mababi, bikagenda byiyongera kugeza ubwo amababi ashobora kwuma. Uburyo bwo Kurwanya: Imiti y’Uduhumyo (Fungicides): Koresha imiti nka Mancozeb cyangwa Azoxystrobin kugira ngo urinde ibimera.',
                'b. Ububembe bw’Ibigori (Maize Smut): Iyi ndwara iterwa n’agahumyo Ustilago maydis. Itera ibibyimba bimeze nk’ibirundo ku mababi no ku mbuto z’ibigori. Ibimenyetso: Ku mababi no ku bisaka hagaragara ibibyimba bimeze nk’ibifite amabara y’umukara cyangwa ibirundi. Uburyo bwo Kurwanya: Guhindura imyaka: Jya ukorera ibigori byahinzwe mu murima wundi byibuze imyaka ibiri itaha.',
                'c. Ikibembe cy’Ibigori (Maize Streak Virus): Iterwa n’udukoko twa virusi twinjira mu bigori tukwirakwizwa n’imibu y\'ibigori. Ibimenyetso: Ibigori bifata ibara ry’umuhondo ku mababi, bikagenda byikururira ku mpande, ibi bigabanya umusaruro.',
            ],
        },
        {
            title: '2. Ibyonnyi Bifata Ibigori (Pests)',
            paragraphs: [
                'a. Umubu w’Ibigori (Maize Aphids): Ibi byonnyi biryana amababi y’ibigori kandi bikanyunyuzamo imbaraga. Ibimenyetso: Amababi y’ibigori atangira kuzinga, kandi bigenda bifata ibara ry\'umuhondo mu gihe umubu ubinyunyuza intungamubiri. Uburyo bwo Kurwanya: Imiti: Koresha imiti nka Imidacloprid cyangwa Lambda-cyhalothrin.',
                'b. Isazi ya Stalk Borer (Busseola Fusca): Iyi ni imwe mu byonnyi bikomeye byibasira ibigori mu Rwanda. Ibimenyetso: Hagaragara umweru ku ishusho y’ibigori, kandi ibisaka bishobora kwuma no gupfa.',
                'c. Utuyoka tw’Ibigori (Fall Armyworm): Utu tuyoka twibasira amababi n’isugi z’ibigori, tukayangiza bikomeye mu myaka y’ibigori.',
            ],
        },
        // Additional content can be added here
    ];

    // Filter content based on search query
    const filteredData = contentData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.paragraphs.some(paragraph => paragraph.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <ScrollView style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Shakisha..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {filteredData.map((item, index) => (
                <View key={index} style={styles.contentSection}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.paragraphs.map((paragraph, idx) => (
                        <Text key={idx} style={styles.paragraph}>
                            {paragraph}
                        </Text>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F8F8F8',
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 16,
    },
    contentSection: {
        marginBottom: 16,
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 8,
    },
});

export default Maize;
