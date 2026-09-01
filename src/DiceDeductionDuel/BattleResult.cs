namespace DiceDeductionDuel;

public enum BattleOutcome
{
    PlayerVictory,
    EnemyVictory,
    Draw
}

public sealed record TurnRecord(
    int Turn,
    bool IsPlayerAttack,
    string AttackerName,
    int AttackRoll,
    int Damage,
    int DefenderRemainingHealth);

public sealed record BattleResult(
    BattleOutcome Outcome,
    int TurnCount,
    IReadOnlyList<TurnRecord> Turns);
