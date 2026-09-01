namespace DiceDeductionDuel.Tests;

public class BattleTests
{
    [Fact]
    public void CalculateDamage_ReturnsAtLeastOne_WhenDefenseIsHigher()
    {
        int damage = Battle.CalculateDamage(attack: 2, attackRoll: 1, defense: 10);

        Assert.Equal(1, damage);
    }

    [Fact]
    public void Play_EndsImmediately_WhenDefenderIsDefeated()
    {
        var player = new Fighter("Player", attack: 10, defense: 1, maxHealth: 10);
        var enemy = new Fighter("Enemy", attack: 1, defense: 1, maxHealth: 1);
        var battle = new Battle(new Random(1));

        BattleResult result = battle.Play(player, enemy);

        Assert.Equal(BattleOutcome.PlayerVictory, result.Outcome);
        Assert.Equal(1, result.TurnCount);
        Assert.Equal(0, enemy.CurrentHealth);
    }

    [Fact]
    public void Play_ReturnsDraw_AfterTwentyTurns()
    {
        var player = new Fighter("Player", attack: 1, defense: 100, maxHealth: 100);
        var enemy = new Fighter("Enemy", attack: 1, defense: 100, maxHealth: 100);
        var battle = new Battle(new Random(1));

        BattleResult result = battle.Play(player, enemy);

        Assert.Equal(BattleOutcome.Draw, result.Outcome);
        Assert.Equal(Battle.MaxTurns, result.TurnCount);
        Assert.Equal(Battle.MaxTurns, result.Turns.Count);
    }

    [Fact]
    public void Play_ProducesSameLog_WithSameSeedAndInputs()
    {
        BattleResult first = PlayBattle(seed: 2026);
        BattleResult second = PlayBattle(seed: 2026);

        Assert.Equal(first.Outcome, second.Outcome);
        Assert.Equal(first.Turns, second.Turns);
    }

    private static BattleResult PlayBattle(int seed)
    {
        var player = new Fighter("Player", attack: 4, defense: 3, maxHealth: 25);
        var enemy = new Fighter("Enemy", attack: 3, defense: 4, maxHealth: 25);
        var battle = new Battle(new Random(seed));

        return battle.Play(player, enemy);
    }
}
