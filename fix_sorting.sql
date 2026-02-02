-- アーキタイプの順序を一括更新する関数
-- この関数がないと、管理画面での並び替えが保存できません
CREATE OR REPLACE FUNCTION update_archetype_order(
    orders JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_record JSONB;
BEGIN
    -- 配列内の各要素についてループ処理
    FOR order_record IN SELECT * FROM jsonb_array_elements(orders)
    LOOP
        UPDATE deck_archetypes
        SET display_order = (order_record->>'new_order')::INTEGER
        WHERE id = (order_record->>'id')::UUID;
    END LOOP;
END;
$$;

-- 権限付与
GRANT EXECUTE ON FUNCTION update_archetype_order(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_archetype_order(JSONB) TO anon;
