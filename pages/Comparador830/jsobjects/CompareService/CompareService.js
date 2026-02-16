export default {
  runSaveAll: async () => {
    // 1) Agarra el "comp" del store o directo del API (para evitar race condition del primer click)
    const comp =
      appsmith.store.comparacion ||
      apiComparar830?.data?.[0] ||
      null;

    if (!comp) {
      throw new Error("No existe 'comparacion'. Primero corre apiComparar830 y guarda el resultado.");
    }

    const diffs = Array.isArray(comp.diferencias) ? comp.diferencias : [];
    const diffsCount = Number(comp.diferencias_count ?? diffs.length ?? 0);

    // Si aquí te da 0, por eso no inserta diffs
    if (diffs.length === 0) {
      return {
        ok: true,
        note: "No hay diferencias para insertar (diferencias = []).",
        diffs_len: diffs.length,
        diffs_count: diffsCount,
        comp_sample: Object.keys(comp || {}),
      };
    }

    // 2) Insert RUN (qRunInsert usa this.params.comp)
    const runRes = await qRunInsert.run({ comp });

    // Appsmith a veces regresa array, a veces objeto
    const runId =
      (Array.isArray(runRes) ? runRes?.[0]?.id : runRes?.id) ||
      qRunInsert?.data?.[0]?.id ||
      qRunInsert?.data?.id;

    if (!runId) {
      throw new Error("No se pudo obtener run_id. Revisa que qRunInsert tenga 'returning id;'.");
    }

    // 3) Insert DIFFS (qDiffsInsert usa this.params.run_id y this.params.diferencias)
    const diffsRes = await qDiffsInsert.run({
      run_id: runId,
      diferencias: diffs,
      // opcional: si quieres forzar periodo/fechas desde aquí:
      // period_key: moment().format("YYYY-MM"),
      // year: moment().year(),
      // month: moment().month() + 1,
      // iso_week: moment().isoWeek(),
      // year_week: moment().format("GGGG-[W]WW"),
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
