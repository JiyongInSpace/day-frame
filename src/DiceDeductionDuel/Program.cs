using DiceDeductionDuel;

const int seed = 2026;

var player = new Fighter("Player", attack: 4, defense: 3, maxHealth: 25);
var enemy = new Fighter("Enemy", attack: 3, defense: 4, maxHealth: 25);
var battle = new Battle(new Random(seed));

BattleResult result = battle.Play(player, enemy);

Console.WriteLine("주사위 추론 대결");
Console.WriteLine($"시드: {seed}");
Console.WriteLine();

foreach (TurnRecord turn in result.Turns)
{
    if (turn.IsPlayerAttack)
    {
        Console.WriteLine(
            $"{turn.Turn}턴: 공격 주사위 {turn.AttackRoll}, 적에게 피해를 {turn.Damage}만큼 입혔습니다.");
    }
    else
    {
        Console.WriteLine(
            $"{turn.Turn}턴: 적의 공격 주사위는 공개되지 않습니다. 피해를 {turn.Damage}만큼 받았습니다. " +
            $"내 체력: {turn.DefenderRemainingHealth}");
    }
}

Console.WriteLine();
string outcomeText = result.Outcome switch
{
    BattleOutcome.PlayerVictory => "승리",
    BattleOutcome.EnemyVictory => "패배",
    BattleOutcome.Draw => "무승부",
    _ => throw new InvalidOperationException("알 수 없는 전투 결과입니다.")
};

Console.WriteLine($"전투 결과: {outcomeText}");
Console.WriteLine($"내 체력: {player.CurrentHealth}/{player.MaxHealth}");
Console.WriteLine($"적 체력: {enemy.CurrentHealth}/{enemy.MaxHealth}");
