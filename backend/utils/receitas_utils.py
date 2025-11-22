import unicodedata
from functools import lru_cache

@lru_cache(maxsize=1024)
def normalizar_texto(texto: str) -> str:
    """Normaliza texto removendo acentos e convertendo para minúsculas"""
    if not texto:
        return ""
    texto = unicodedata.normalize('NFD', texto)
    texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn')
    return texto.lower()

def buscar_receitas(conn, ingredientes):
    """Busca receitas que contenham todos os ingredientes especificados"""
    if not conn or not ingredientes:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.id, r.titulo, r.nota, r.avaliacoes, r.autor, 
                   r.tempo_preparo, r.link, r.imagem, GROUP_CONCAT(i.item, '|||') as ings
            FROM recipes r
            LEFT JOIN ingredients i ON i.recipe_id = r.id
            GROUP BY r.id
        """)
        
        search_ings = [normalizar_texto(ing.strip()) for ing in ingredientes]
        matches = []
        
        for row in cursor.fetchall():
            row_dict = dict(row)
            all_ings = row_dict.get('ings', '')
            
            if not all_ings:
                continue
            
            recipe_ings = [normalizar_texto(ing) for ing in all_ings.split('|||')]
            
            # Verifica se todos os ingredientes de busca estão presentes
            if all(any(si in ri for ri in recipe_ings) for si in search_ings):
                matches.append({
                    'id': row_dict['id'],
                    'titulo': row_dict['titulo'],
                    'nota': row_dict['nota'],
                    'avaliacoes': row_dict['avaliacoes'],
                    'autor': row_dict['autor'],
                    'tempo_preparo': row_dict['tempo_preparo'],
                    'link': row_dict['link'],
                    'imagem': row_dict['imagem']
                })
        
        # Ordena por nota e avaliações
        def calcular_score(r):
            nota = 0.0
            if r['nota'] and r['nota'] != 'N/A':
                try:
                    nota = float(r['nota'])
                except:
                    pass
            
            aval = 0
            if r['avaliacoes'] and r['avaliacoes'] != 'N/A':
                try:
                    aval = int(r['avaliacoes'].replace(' votos', '').replace(' voto', '').strip())
                except:
                    pass
            
            return (-nota, -aval)
        
        matches.sort(key=calcular_score)
        return matches
        
    except Exception as e:
        print(f"Search Error: {e}")
        return []