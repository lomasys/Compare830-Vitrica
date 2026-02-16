export default {
  runSaveAll: async () => {
    // 1) Tomar comp del store o directo del API
    let comp =
      appsmith.store.comparacion ||
      apiComparar830?.data?.[0] ||
      apiComparar830?.data ||
      null;

    // 2) Normalizar formatos raros
    if (Array.isArray(comp)) comp = comp[0];

    if (typeof comp === "string") {
      // Si por error guardaste string JSON, lo recuperamos
      try {
        comp = JSON.parse(comp);
      } catch (e) {
        // Si no es JSON, dejamos que truene con mensaje claro abajo
      }
    }

    if (!comp || typeof comp !== "object") {
      throw new Error(
        "comparacion NO es objeto válido. Revisa el Store value: debe ser {{ apiComparar830.data?.[0] }} (SIN concatenar texto, SIN stringify)."
      );
    }

    // 3) Obtener diffs de manera segura
    const diffs =
      Array.isArray(comp.diferencias) ? comp.diferencias :
      Array.isArray(comp.diffs) ? comp.diffs :
      [];

    const diffsCount = Number(comp.diferencias_count ?? diffs.length ?? 0);

    // Si aquí te da 0, por eso no inserta diffs
    if (diffs.length === 0) {
      return {
        ok: true,
        note: "No hay diferencias para insertar (diferencias = []).",
        diffs_len: diffs.length,
        diffs_count: diffsCount,
        comp_keys: Object.keys(comp || {}),
        comp_diferencias_type: typeof comp.diferencias,
      };
    }

    // 4) Insert RUN (qRunInsert usa this.params.comp)
    const runRes = await qRunInsert.run({ comp });

    const runId =
      (Array.isArray(runRes) ? runRes?.[0]?.id : runRes?.id) ||
      qRunInsert?.data?.[0]?.id ||
      qRunInsert?.data?.id;

    if (!runId) {
      throw new Error("No se pudo obtener run_id. Revisa que qRunInsert tenga 'returning id;'.");
    }

    // 5) Insert DIFFS (qDiffsInsert usa this.params.run_id y this.params.diferencias)
    const diffsRes = await qDiffsInsert.run({
      run_id: runId,
      diferencias: diffs,
    });

    return {
      ok: true,
      run_id: runId,
      diffs_len: diffs.length,
      diffs_count: diffsCount,
      run_insert: runRes,
      diffs_insert: diffsRes,
    };
  },
};

