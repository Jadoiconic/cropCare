import { StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';

const Ibirayi = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Content data
    const content = [
        {
            section: "1. Gukurikirana no Gusuzuma Ubutaka (Soil Testing)",
            details: "Ubwoko bw’ubutaka bufite uruhare rukomeye mu buryo ifumbire ikoreshwa...",
        },
        {
            section: "2. Guhitamo Imbuto Ziza (Seed Potatoes)",
            details: "Imbuto z'ibirayi: Hitamo imbuto zifite ubwiza, zifite amabara atandukanye...",
        },
        {
            section: "3. Gutunganya Umurima (Land Preparation)",
            details: "Gucukura umurima: Cukura umurima neza, ukureho utunyabuzima twose twangiza...",
        },
        {
            section: "4. Gufumbira Ibirayi",
            details: "Nitrogen (N): Ifumbire ya Urea cyangwa Ammonium Sulfate ifasha mu mikurire y’amababi...",
        },
        {
            section: "5. Uburyo bwo Gukoresha Ifumbire (Application Methods)",
            details: "Shallow Broadcasting: Gushyira ifumbire ku buso bw’umurima mbere yo gucukura...",
        },
        {
            section: "6. Igihe Nyacyo cyo Gufumbira (Fertilizer Timing)",
            details: "Nyuma yo gutera: Shyira ifumbire ya NPK mbere yo gutera cyangwa mu mirongo y’imbuto...",
        },
        {
            section: "7. Gucunga no Gukurikirana Ifumbire",
            details: "Kugenzura Ikoreshwa ry’Ifumbire: Koresha ifumbire uko bikwiye hakurikijwe ibyifuzo...",
        },
        {
            section: "8. Igenzura rya PH y’Ubutaka",
            details: "Ibirayi bikenera ubutaka bufite pH hagati ya 5.5 na 6.5...",
        }
    ];

    // Filter content based on the search query
    const filteredContent = content.filter(item =>
        item.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Shakisha hano (Search here)..."
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Main Title */}
                <Text style={styles.title}>Ibirayi</Text>

                {/* Display filtered content */}
                {filteredContent.length > 0 ? (
                    filteredContent.map((item, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.sectionTitle}>{item.section}</Text>
                            <Text style={styles.paragraph}>{item.details}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noResults}>Nta bisubizo bibonetse (No results found)</Text>
                )}
            </ScrollView>
        </View>
    );
}

export default Ibirayi;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F8F8F8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 16,
        textAlign: 'center',
    },
    searchBar: {
        height: 40,
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 16,
        backgroundColor: '#FFF',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    noResults: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
    },
});
