-- Google Sheets同期用のデータベース関数
-- この関数は、スプレッドシートから送られてきたカードデータを安全に更新します
-- 既存の画像URLは保持し、採用枚数とカテゴリのみ更新します

CREATE OR REPLACE FUNCTION sync_key_cards(
    deck_name TEXT,
    cards JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    archetype_record RECORD;
    card_record JSONB;
    existing_card RECORD;
    result JSON;
    updated_count INT := 0;
    inserted_count INT := 0;
    deleted_count INT := 0;
    card_names TEXT[];
BEGIN
    -- デッキタイプ（アーキタイプ）を検索
    SELECT * INTO archetype_record
    FROM deck_archetypes
    WHERE name = deck_name
    LIMIT 1;
    
    -- デッキタイプが見つからない場合はエラー
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Deck archetype not found: ' || deck_name
        );
    END IF;
    
    -- スプレッドシートから送られてきたカード名のリストを作成
    SELECT array_agg(card->>'card_name')
    INTO card_names
    FROM jsonb_array_elements(cards) AS card;
    
    -- スプレッドシートにないカードを削除
    DELETE FROM key_card_adoptions
    WHERE archetype_id = archetype_record.id
    AND card_name != ALL(card_names);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- 各カードを処理
    FOR card_record IN SELECT * FROM jsonb_array_elements(cards)
    LOOP
        -- 既存のカードを検索
        SELECT * INTO existing_card
        FROM key_card_adoptions
        WHERE archetype_id = archetype_record.id
        AND card_name = card_record->>'card_name'
        LIMIT 1;
        
        IF FOUND THEN
            -- 既存カードの場合: 採用枚数とカテゴリのみ更新（画像URLは保持）
            UPDATE key_card_adoptions
            SET 
                adoption_quantity = (card_record->>'adoption_quantity')::NUMERIC,
                category = card_record->>'category',
                created_at = NOW() -- 更新日時を記録
            WHERE id = existing_card.id;
            
            updated_count := updated_count + 1;
        ELSE
            -- 新規カードの場合: 挿入（画像URLは空）
            INSERT INTO key_card_adoptions (
                archetype_id,
                card_name,
                adoption_quantity,
                category,
                image_url
            ) VALUES (
                archetype_record.id,
                card_record->>'card_name',
                (card_record->>'adoption_quantity')::NUMERIC,
                card_record->>'category',
                NULL -- 画像は後で手動設定
            );
            
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    -- 結果を返す
    result := json_build_object(
        'success', true,
        'archetype', deck_name,
        'updated', updated_count,
        'inserted', inserted_count,
        'deleted', deleted_count,
        'total_cards', updated_count + inserted_count
    );
    
    RETURN result;
END;
$$;

-- この関数を公開APIとして使えるようにする
GRANT EXECUTE ON FUNCTION sync_key_cards(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION sync_key_cards(TEXT, JSONB) TO authenticated;