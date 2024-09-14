import * as pronote from "pawnote"; // Ajustez le chemin si nécessaire

export const getSkills = async (account: any, periodName: string): Promise<any[]> => {
  const session = pronote.createSessionHandle();
  await pronote.loginCredentials(session, {
    url: account.pronoteURL,
    kind: pronote.AccountKind.STUDENT,
    username: account.username,
    password: account.password,
    deviceUUID: account.deviceUUID,
  });

  const tab = session.userResource.tabs.get(pronote.TabLocation.Evaluations);
  if (!tab) throw new Error("Cannot retrieve evaluations tab.");

  const selectedPeriod = tab.periods.find(period => period.name === periodName);
  if (!selectedPeriod) throw new Error("Selected period not found.");

  const evaluations = await pronote.evaluations(session, selectedPeriod);

  const fetchedSkills: any[] = [];
  evaluations.forEach(evaluation => {
    evaluation.skills.forEach(skill => {
      fetchedSkills.push({
        id: skill.itemName || skill.abbreviation,
        name: skill.itemName || "Compétence Inconnue",
        description: `${skill.level} : ${skill.abbreviation} (x${skill.coefficient})`,
      });
    });
  });

  return fetchedSkills;
};