import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';

const Ibirayi = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Sample data to filter
    const contentData = [
        {
            title: 'Uburyo bwo Kurwanya Ibidukikije n’Indwara mu Buhinzi bw’Ibirayi Hagendewe ku Mabwiriza ya RAB',
            paragraphs: [
                'Kurwanya ibyonnyi n’indwara mu birayi ni ingenzi kugira ngo umusaruro w’ibirayi ube mwiza kandi wuzuye.',
                'Indwara n’ibyonnyi bibasira ibirayi bishobora kugabanya umusaruro ku gipimo kinini cyangwa bikaba byateza igihombo gikomeye.',
                'Reka turebere hamwe uburyo bwo gukumira no kurwanya ibi bibazo mu buryo burambuye kandi bworoshye kumva.',
            ],
        },
        {
            title: '1. Indwara z\'Ibirayi',
            paragraphs: [
                'a. Imvura y’Uruvuye (Late Blight) - Iyi ni yo ndwara ihangayikishije cyane mu birayi. Ituruka kuri Parasite yitwa Phytophthora infestans.',
                'b. Umufunzo w\'Ibirayi (Potato Scab) - Iterwa n’agahumyo gatera ibisebe ku bibabi n’ibijumba by’ibirayi.',
                'c. Ikibembe cy\'Ibirayi (Black Leg) - Iterwa n’udukoko twa Erwinia spp. Iyo indwara ituma ibirayi birabirana.',
            ],
        },
        {
            title: '2. Ibyonnyi Bifata Ibirayi (Pests)',
            paragraphs: [
                'a. Umubu w’Ibirayi (Potato Aphids) - Ibi byonnyi bigira ingaruka ku bigize ibirayi, cyane cyane amababi n’imizi.',
                'b. Umuswa w\'Ibirayi (Cutworms) - Umuswa wangiza cyane ibiti bito n’imizi y’ibirayi.',
                'c. Ibisiga n\'Ibikoko (Colorado Potato Beetles) - Ibi byonnyi byangiza cyane amababi y’ibirayi.',
            ],
        },
        {
            title: '3. Uburyo bwo Kurinda Ibirayi mu Murima no Mu Kagari',
            paragraphs: [
                'a. Gushyira Imiti ku Kinyura (Foliar Spraying) - Niba urebye ko ikirere gifite imvura cyangwa amahumbezi.',
                'b. Gutegura Ubutaka Neza - Tegura umurima hakiri kare kandi ukoreho isuku neza mbere yo gutera imbuto.',
                'c. Gukoresha Ifumbire Nziza - Koresha ifumbire y\'imborera hamwe n’ifumbire mvaruganda.',
            ],
        },
        {
            title: '4. Ibikoresho by’Umutekano mu Kurwanya Ibidukikije',
            paragraphs: [
                'Kwambara Imyenda y’Umutekano - Igihe ukoresha imiti, wambare udukoresho nka mask, gloves.',
                'Gushyira Imiti ahantu hakwiriye - Ntugomba kuvanga cyangwa gusiga imiti mu buryo bwo kwanduza ibidukikije.',
            ],
        },
    ];

    // Filter content based on search query
    const filteredData = contentData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.paragraphs.some(paragraph => paragraph.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <TextInput
                style={styles.searchBar}
                placeholder="Shakisha..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {filteredData.map((item, index) => (
                <View key={index}>
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
    title: {
        fontSize: 24,
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

export default Ibirayi;
