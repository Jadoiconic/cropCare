import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'

const Ibirayi = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const contentData = [
        {
            id: 1,
            title: 'Uburyo bwo Kuhira no Kuvomerera Ibirayi Hagendewe ku Mabwiriza ya RAB',
            text: 'Kuhira ibirayi ni ingenzi cyane mu gihembwe cy’izuba, cyangwa mu bice bitagira imvura ihagije, kugira ngo bigume bifite amazi akenewe mu mikurire yabyo. Amazi yihagije atuma ibirayi bikura neza, bigira umusaruro mwiza kandi birinda ibibazo biterwa n’amapfa cyangwa imyuka mibi iva mu butaka bwumutse. Reka dusobanukirwe neza uko wabigenza ngo uhirire neza ibirayi ukurikije uburyo bukoreshwa mu Rwanda, cyane cyane bwashyizwe imbere na RAB.'
        },
        {
            id: 2,
            title: '1. Igihe n’Ubwinshi bw’Amazi Ibirayi Bikenera',
            text: 'Ibirayi bikenera mili-metero 500-700 z’imvura mu gihe cy’ubwumbure n’imikurire yabyo, kugira ngo bikure neza. Amazi menshi cyangwa make cyane ashobora gutera ibibazo mu mikurire y\'ibirayi. Gukoresha amazi ari hagati y’ubwo bushobozi ni ingenzi.'
        },
        {
            id: 3,
            title: 'Icyitonderwa mu bihe bitandukanye by\'ubwumbure',
            text: 'Igihe cyo gutera imbuto: Guhita uhirira ibirayi nyuma yo kubitera bifasha kwinjiza amazi mu butaka, bigatuma imbuto zikura neza. Iki gihe, ubutaka bugomba kuba bufite amazi ahagije.'
        },
        {
            id: 4,
            title: '2. Uburyo bwo Kuhira Ibirayi (Watering Methods)',
            text: 'a. Kuhira hakoreshejwe uburyo bwo Kwonona (Flood Irrigation): Iki ni uburyo bwo kumenamo amazi mu mirongo y’ibirayi yose, maze ayo mazi agafata ku butaka kugeza ubwo anyuze kuri buri gihingwa.'
        },
        {
            id: 5,
            title: '3. Gushiraho Imiyoboro Y’Amazi ku Mirima yo Kuhiriraho',
            text: 'Iyo urima ibirayi ku buryo buhoraho mu bice byizuba, usabwa gushyiraho uburyo bwa drip irrigation kuko ni bwo buryo buhendutse kandi butangiza amazi menshi.'
        },
        {
            id: 6,
            title: '4. Ibindi Byo Kwitondera mu Kuvomerera Ibirayi',
            text: 'Kwita ku butaka: Ubutaka bw’ibirayi bugomba kuba bufite ubushobozi bwo gukomeza amazi adakomeye. Ubutaka bw’ibumba cyane cyangwa ubutaka bushobora kubika amazi menshi burwanya gutuma ibirayi bikura neza.'
        },
        {
            id: 7,
            title: '5. Igihe Cyiza cyo Kuhira',
            text: 'Mu gitondo kare cyangwa mu mugoroba ni igihe cyiza cyo kuhira ibirayi, kugira ngo wirinde gukoresha amazi mu gihe ubushyuhe buri hejuru cyane, kuko amazi yakwangirika cyangwa akamarwa n\'izuba.'
        },
        {
            id: 8,
            title: '6. Ibyiza byo Kuvomerera Neza',
            text: 'Ibirayi byakuwe mu buryo bwiza bwo kuvomerera bigira umubyibuho mwiza, bihungura ibibazo by’indwara iterwa no kumagara, bigatuma umusaruro uba mwinshi.'
        },
        {
            id: 9,
            title: 'Umwanzuro',
            text: 'Kuhira ibirayi ni ingenzi cyane kugira ngo bigume bifite amazi ahagije bigatuma bikura neza. Gutegura umurima no gushyira imiyoboro y’amazi ahantu hakwiye, no guhitamo uburyo buboneye bwo kuvomerera, byafasha kurinda ibihingwa by’ibirayi no kuzamura umusaruro. Abahinzi basabwa kumenya uburyo bugezweho bw\'ihiriri kugira ngo bashobore gufata neza umurima w’ibirayi, by\'umwihariko mu gihembwe cy’izuba.'
        }
    ];

    // Filter content based on search term
    const filteredContent = contentData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Ibirayi</Text>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Shakisha..."
                onChangeText={setSearchTerm}
                value={searchTerm}
            />

            <ScrollView>
                {filteredContent.length > 0 ? (
                    filteredContent.map(item => (
                        <View key={item.id} style={styles.section}>
                            <Text style={styles.subHeader}>{item.title}</Text>
                            <Text style={styles.content}>{item.text}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noResults}>Nta bisubizo bibonetse.</Text>
                )}
            </ScrollView>
        </View>
    );
}

export default Ibirayi

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4CAF50',
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    section: {
        marginBottom: 15,
    },
    content: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
        color: '#4CAF50',
    },
    noResults: {
        fontSize: 16,
        color: '#FF0000',
        textAlign: 'center',
        marginTop: 20,
    },
});
