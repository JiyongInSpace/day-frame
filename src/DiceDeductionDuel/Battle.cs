namespace DiceDeductionDuel;

public sealed class Battle
{
    public const int MaxTurns = 20;

    private readonly Random _random;

    public Battle(Random random)
    {
        _random = random;
    }

    public BattleResult Play(Fighter player, Fighter enemy)
    {
        var turns = new List<TurnRecord>();

        for (int turn = 1; turn <= MaxTurns; turn++)
        {
            bool isPlayerAttack = turn % 2 == 1;
            Fighter attacker = isPlayerAttack ? player : enemy;
            Fighter defender = isPlayerAttack ? enemy : player;
            int attackRoll = _random.Next(1, 7);
            int damage = CalculateDamage(attacker.Attack, attackRoll, defender.Defense);

            defender.TakeDamage(damage);
            turns.Add(new TurnRecord(
                turn,
                isPlayerAttack,
                attacker.Name,
                attackRoll,
                damage,
                defender.CurrentHealth));

            if (defender.IsDefeated)
            {
                BattleOutcome outcome = isPlayerAttack
                    ? BattleOutcome.PlayerVictory
                    : BattleOutcome.EnemyVictory;

                return new BattleResult(outcome, turn, turns);
            }
        }

        return new BattleResult(BattleOutcome.Draw, MaxTurns, turns);
    }

    public static int CalculateDamage(int attack, int attackRoll, int defense)
    {
        return Math.Max(1, attack + attackRoll - defense);
    }
}
